import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

import { PrismaService } from '../../prisma/prisma.service';
import { BatchRegistryABI } from '../blockchain/abi';
import { BatchRegistryBytecode } from '../blockchain/bytecode';
import { computeBatchHash } from './batch-hash';

type Mode = 'external' | 'embedded' | 'off';

/**
 * Wrapper around the BatchRegistry smart contract.
 *
 * Three modes:
 *  - external: BLOCKCHAIN_RPC_URL + BLOCKCHAIN_PRIVATE_KEY + BLOCKCHAIN_CONTRACT_ADDRESS
 *              are set (local Hardhat node, Sepolia, any EVM chain).
 *  - embedded: (default when those are missing) the API starts its own in-process
 *              Ethereum chain (Ganache), deploys BatchRegistry itself and re-anchors
 *              existing batches from the database. Zero setup for hosting.
 *  - off:      BLOCKCHAIN_MODE=off. Writes are no-ops.
 *
 * Re-anchoring (embedded mode): the in-process chain starts empty after each
 * restart, so every batch whose current data still matches the fingerprint
 * stored at creation (Batch.blockchainHash) is registered again, and revoked
 * batches are revoked again. Batches whose data no longer matches are NOT
 * re-registered, so tampering is still detected.
 */
@Injectable()
export class ChainService implements OnModuleInit {
  private readonly logger = new Logger(ChainService.name);
  private contract?: ethers.Contract;
  private readonly mode: Mode;
  private ready: Promise<void> = Promise.resolve();
  private embeddedAddress?: string;
  private embeddedFailed = false;

  constructor(private prisma: PrismaService) {
    const { BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, BLOCKCHAIN_CONTRACT_ADDRESS, BLOCKCHAIN_MODE } = process.env;

    if (BLOCKCHAIN_MODE === 'off') {
      this.mode = 'off';
      this.logger.warn('BLOCKCHAIN_MODE=off. On-chain features are disabled.');
      return;
    }

    if (BLOCKCHAIN_RPC_URL && BLOCKCHAIN_PRIVATE_KEY && BLOCKCHAIN_CONTRACT_ADDRESS) {
      this.mode = 'external';
      const provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
      const wallet = new ethers.Wallet(BLOCKCHAIN_PRIVATE_KEY, provider);
      this.contract = new ethers.Contract(BLOCKCHAIN_CONTRACT_ADDRESS, BatchRegistryABI, wallet);
      return;
    }

    this.mode = 'embedded';
  }

  onModuleInit() {
    if (this.mode !== 'embedded') return;
    // Writes and reads wait for this, so requests made during start-up still work.
    this.ready = this.startEmbedded().catch((err) => {
      this.logger.error(`Embedded blockchain failed to start: ${(err as Error).message}`);
      this.contract = undefined;
      this.embeddedFailed = true;
    });
  }

  private async startEmbedded() {
    // Loaded lazily: only needed in embedded mode.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ganache = require('ganache');
    const chain = ganache.provider({
      logging: { quiet: true },
      wallet: { deterministic: true, totalAccounts: 2 },
      chain: { chainId: 1337 },
      miner: { instamine: 'eager' },
    });
    const provider = new ethers.providers.Web3Provider(chain);
    const signer = provider.getSigner(0);

    const factory = new ethers.ContractFactory(BatchRegistryABI, BatchRegistryBytecode, signer);
    const contract = await factory.deploy();
    await contract.deployed();
    this.contract = contract;
    this.embeddedAddress = contract.address;
    this.logger.log(`Embedded Ethereum chain started; BatchRegistry deployed at ${contract.address}`);

    // A re-anchor problem (e.g. database not reachable yet) must not disable the chain.
    await this.reanchor().catch((err) => this.logger.warn(`Re-anchoring skipped: ${(err as Error).message}`));
  }

  /** Re-registers untampered batches (and re-revokes revoked ones) on the fresh embedded chain. */
  private async reanchor() {
    if (!this.contract) return;
    const batches = await this.prisma.batch.findMany({
      where: { blockchainHash: { not: null } },
      select: {
        batchNumber: true,
        drugName: true,
        manufactureDate: true,
        expiryDate: true,
        quantity: true,
        blockchainHash: true,
        status: true,
        revocationReason: true,
      },
    });

    let anchored = 0;
    let skipped = 0;
    for (const b of batches) {
      if (computeBatchHash(b) !== b.blockchainHash) {
        skipped++; // data changed since creation: leave unregistered so verification flags it
        continue;
      }
      try {
        await (await this.contract.registerBatch(b.batchNumber, b.blockchainHash)).wait();
        if (b.status === 'REVOKED' || b.status === 'DESTROYED') {
          await (await this.contract.revokeBatch(b.batchNumber, b.revocationReason || b.status)).wait();
        }
        anchored++;
      } catch (err) {
        this.logger.warn(`Re-anchor failed for ${b.batchNumber}: ${(err as Error).message}`);
      }
    }
    if (batches.length) {
      this.logger.log(`Re-anchored ${anchored} batch(es) on the embedded chain${skipped ? `, ${skipped} skipped (data changed)` : ''}.`);
    }
  }

  get enabled(): boolean {
    if (this.mode === 'embedded') return !this.embeddedFailed;
    return this.mode === 'external' && !!this.contract;
  }

  get network(): string {
    if (this.mode === 'embedded') return 'embedded (in-app Ethereum)';
    return process.env.BLOCKCHAIN_NETWORK || 'localhost';
  }

  get contractAddress(): string | undefined {
    return this.mode === 'embedded' ? this.embeddedAddress : process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
  }

  async registerBatch(batchNumber: string, batchHash: string): Promise<string | null> {
    await this.ready;
    if (!this.contract) return null;
    const tx = await this.contract.registerBatch(batchNumber, batchHash);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async getBatch(batchNumber: string) {
    await this.ready;
    const empty = { batchNumber, batchHash: '', registeredAt: 0, revoked: false, revokedAt: 0, revocationReason: '' };
    if (!this.contract) return empty;
    try {
      const d = await this.contract.getBatchDetails(batchNumber);
      return {
        batchNumber,
        batchHash: d.batchHash as string,
        registeredAt: Number(d.registeredAt),
        registeredBy: d.registeredBy as string,
        revoked: d.revoked as boolean,
        revokedAt: Number(d.revokedAt),
        revocationReason: d.revocationReason as string,
      };
    } catch {
      // Older deployments only expose getBatch().
      try {
        const b = await this.contract.getBatch(batchNumber);
        return { ...empty, batchHash: b[1], registeredAt: Number(b[2]) };
      } catch {
        return empty;
      }
    }
  }

  /** Revokes on-chain. Never throws: revocation in the database must not fail because of the chain. */
  async revokeBatch(batchNumber: string, reason: string): Promise<string | null> {
    await this.ready;
    if (!this.contract) return null;
    try {
      const registered: boolean = await this.contract.isRegistered(batchNumber);
      if (!registered) return null;
      const alreadyRevoked: boolean = await this.contract.isRevoked(batchNumber);
      if (alreadyRevoked) return null;
      const tx = await this.contract.revokeBatch(batchNumber, reason);
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (err) {
      this.logger.error(`On-chain revocation failed for ${batchNumber}: ${(err as Error).message}`);
      return null;
    }
  }

  async stats() {
    await this.ready;
    if (!this.enabled || !this.contract) return { enabled: false, network: this.network };
    try {
      const [totalBatches, totalRevoked] = await Promise.all([this.contract.totalBatches(), this.contract.totalRevoked()]);
      return {
        enabled: true,
        mode: this.mode,
        network: this.network,
        contractAddress: this.contractAddress,
        totalBatches: Number(totalBatches),
        totalRevoked: Number(totalRevoked),
      };
    } catch {
      return { enabled: true, mode: this.mode, network: this.network, contractAddress: this.contractAddress };
    }
  }
}
