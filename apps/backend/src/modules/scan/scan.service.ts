import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ScanHistoryService } from '../scan-history/scan-history.service';
import { ViolationsService } from '../infra/violations.service';

const DAY = 86_400_000;

export type Verdict = 'SAFE' | 'WARNING' | 'BLOCKED' | 'COUNTERFEIT';

/**
 * One call for the mobile scanner: identifies the batch from a QR code or batch
 * number, checks the blockchain fingerprint, recall, expiry and revocation,
 * records the scan, and returns a single verdict with human-readable reasons.
 */
@Injectable()
export class ScanService {
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
    private history: ScanHistoryService,
    private violations: ViolationsService,
  ) {}

  async scan(rawCode: string, userId: string) {
    const code = rawCode.trim();
    const batchNumber = code.replace(/^PG-/i, '');
    const scannedAt = new Date();

    const found = await this.prisma.batch.findFirst({
      where: { OR: [{ qrCode: code }, { batchNumber: code }, { batchNumber }] },
      select: { id: true, batchNumber: true },
    });

    if (!found) {
      await this.history.create({ userId, batchNumber, qrCode: code, verified: false, result: 'NOT_FOUND' });
      await this.violations.record({
        type: 'UNKNOWN_PRODUCT_SCAN',
        severity: 'HIGH',
        description: 'Unknown QR code scanned (possible counterfeit).',
        userId,
        metadata: { qrCode: code },
      });
      return {
        verdict: 'COUNTERFEIT' as Verdict,
        headline: 'Unknown product',
        reasons: ['This code is not registered on PharmaGuard. Do not dispense. It may be counterfeit.'],
        code,
        scannedAt,
      };
    }

    // Verifying can revoke a tampered batch, so read the batch again afterwards.
    const chain = await this.blockchain.verifyBatch(found.batchNumber);
    const batch = await this.prisma.batch.findUniqueOrThrow({
      where: { id: found.id },
      include: {
        manufacturer: { select: { name: true } },
        recalls: { where: { status: 'ACTIVE' }, take: 1 },
      },
    });
    const held = await this.prisma.inventory.aggregate({
      where: { batchId: batch.id, ownerUserId: userId },
      _sum: { quantity: true },
    });

    const daysToExpiry = Math.ceil((batch.expiryDate.getTime() - Date.now()) / DAY);
    const recall = batch.recalls[0];
    const chainDisabled = chain.action === 'BLOCKCHAIN_DISABLED';
    const reasons: string[] = [];
    let verdict: Verdict = 'SAFE';

    if (!chainDisabled && !chain.verified) {
      verdict = 'BLOCKED';
      reasons.push(
        chain.action === 'NOT_REGISTERED'
          ? 'Not registered on the blockchain.'
          : 'Data does not match its blockchain fingerprint. Possible tampering.',
      );
    }
    if (chain.revokedOnChain || batch.status === 'REVOKED' || batch.status === 'DESTROYED') {
      verdict = 'BLOCKED';
      reasons.push(`Digital identity revoked${batch.revocationReason ? ` (${batch.revocationReason.replace(/_/g, ' ').toLowerCase()})` : ''}.`);
    }
    if (recall || batch.status === 'RECALLED') {
      verdict = 'BLOCKED';
      reasons.push(`Under ${recall?.severity?.toLowerCase() ?? ''} recall${recall ? `: ${recall.reason}` : ''}.`);
    }
    if (daysToExpiry <= 0) {
      verdict = 'BLOCKED';
      reasons.push(`Expired on ${batch.expiryDate.toDateString()}.`);
    }
    if (verdict === 'SAFE' && daysToExpiry <= 30) {
      verdict = 'WARNING';
      reasons.push(`Expires in ${daysToExpiry} day(s). Dispense first (FEFO).`);
    }
    if (verdict === 'SAFE') {
      reasons.push(chainDisabled ? 'Batch is active, in date and not recalled.' : 'Authentic: blockchain fingerprint matches. In date and not recalled.');
    }

    await this.history.create({
      userId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      qrCode: code,
      verified: verdict === 'SAFE' || verdict === 'WARNING',
      result: verdict,
    });

    return {
      verdict,
      headline:
        verdict === 'SAFE' ? 'Safe to dispense' : verdict === 'WARNING' ? 'Safe, expiring soon' : 'Do not dispense',
      reasons,
      code,
      scannedAt,
      batch: {
        id: batch.id,
        drugName: batch.drugName,
        batchNumber: batch.batchNumber,
        manufacturer: batch.manufacturer?.name,
        manufactureDate: batch.manufactureDate,
        expiryDate: batch.expiryDate,
        daysToExpiry,
        status: batch.status,
        category: batch.category,
        storageConditions: batch.storageConditions,
        unitsHeld: held._sum.quantity ?? 0,
      },
      blockchain: {
        verified: !!chain.verified,
        enabled: !chainDisabled,
        network: chain.network,
        contractAddress: chain.contractAddress,
        transactionHash: batch.transactionHash,
        fingerprint: chain.blockchainHash || batch.blockchainHash,
        revokedOnChain: !!chain.revokedOnChain,
      },
      recall: recall ? { recallNumber: recall.recallNumber, severity: recall.severity, reason: recall.reason } : null,
    };
  }
}
