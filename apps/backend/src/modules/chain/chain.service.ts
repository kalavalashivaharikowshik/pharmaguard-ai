import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

import { BatchRegistryABI } from '../blockchain/abi';

/**
 * Thin wrapper around the BatchRegistry smart contract.
 *
 * Kept separate from BlockchainService so other modules (revocation, expiry,
 * recalls) can write to the chain without circular dependencies. When the
 * blockchain environment variables are missing the service stays disabled and
 * every write becomes a no-op, so the API still boots (useful for demos).
 */
@Injectable()
export class ChainService {
  private readonly logger = new Logger(ChainService.name);
  private readonly contract?: ethers.Contract;

  constructor() {
    const { BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, BLOCKCHAIN_CONTRACT_ADDRESS } = process.env;

    if (!BLOCKCHAIN_RPC_URL || !BLOCKCHAIN_PRIVATE_KEY || !BLOCKCHAIN_CONTRACT_ADDRESS) {
      this.logger.warn('Blockchain env vars missing. On-chain features are disabled.');
      return;
    }

    const provider = new ethers.providers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(BLOCKCHAIN_PRIVATE_KEY, provider);
    this.contract = new ethers.Contract(BLOCKCHAIN_CONTRACT_ADDRESS, BatchRegistryABI, wallet);
  }

  get enabled(): boolean {
    return !!this.contract;
  }

  get network(): string {
    return process.env.BLOCKCHAIN_NETWORK || 'localhost';
  }

  get contractAddress(): string | undefined {
    return process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
  }

  async registerBatch(batchNumber: string, batchHash: string): Promise<string | null> {
    if (!this.contract) return null;
    const tx = await this.contract.registerBatch(batchNumber, batchHash);
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }

  async getBatch(batchNumber: string) {
    if (!this.contract) {
      return { batchNumber, batchHash: '', registeredAt: 0, revoked: false, revokedAt: 0, revocationReason: '' };
    }
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
        return { batchNumber, batchHash: b[1], registeredAt: Number(b[2]), revoked: false, revokedAt: 0, revocationReason: '' };
      } catch {
        return { batchNumber, batchHash: '', registeredAt: 0, revoked: false, revokedAt: 0, revocationReason: '' };
      }
    }
  }

  /** Revokes on-chain. Never throws: revocation in the database must not fail because of the chain. */
  async revokeBatch(batchNumber: string, reason: string): Promise<string | null> {
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
    if (!this.contract) return { enabled: false, network: this.network };
    try {
      const [totalBatches, totalRevoked] = await Promise.all([
        this.contract.totalBatches(),
        this.contract.totalRevoked(),
      ]);
      return {
        enabled: true,
        network: this.network,
        contractAddress: this.contractAddress,
        totalBatches: Number(totalBatches),
        totalRevoked: Number(totalRevoked),
      };
    } catch {
      return { enabled: true, network: this.network, contractAddress: this.contractAddress };
    }
  }
}
