import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';

import { ValidateSaleDto } from './dto/validate-sale.dto';

import { ScanHistoryService } from '../scan-history/scan-history.service';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private scanHistoryService: ScanHistoryService,
  ) {}

  async validateSale(
    dto: ValidateSaleDto,
    userId: string,
  ) {

    const batch =
      await this.prisma.batch.findFirst({
        where: {
          qrCode: dto.qrCode,
        },
      });

    if (!batch) {

    await this.scanHistoryService.create({

      userId,

      batchNumber: 'UNKNOWN',

      qrCode: dto.qrCode,

      verified: false,

      result: 'NOT_FOUND',

    });

    throw new NotFoundException(
      'Batch not found',
    );

  }

    if (
      batch.status === 'REVOKED'
    ) {

      await this.scanHistoryService.create({

        userId,

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        qrCode: dto.qrCode,

        verified: false,

        result: 'REVOKED',

      });
       return {
         approved: false,
         reason: 'REVOKED',
       };
    }

    // Blockchain Verification

    const verification =
      await this.blockchainService.verifyBatch(
        batch.batchNumber,
      );

    if (!verification.verified) {

      await this.scanHistoryService.create({

        userId,

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        qrCode: dto.qrCode,

        verified: false,

        result: 'BLOCKCHAIN_VERIFICATION_FAILED',

      });
      return {
        approved: false,
        reason:
          'BLOCKCHAIN_VERIFICATION_FAILED',
      };
    }

    // Recall Check

    if (
      batch.status === 'RECALLED'
    ) {
      await this.scanHistoryService.create({

        userId,

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        qrCode: dto.qrCode,

        verified: false,

        result: 'RECALLED',

      });
      return {
        approved: false,
        reason: 'RECALLED',
      };
    }

    // Expiry Check

    const now = new Date();

    if (
      batch.expiryDate < now
    ) {
      await this.scanHistoryService.create({

        userId,

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        qrCode: dto.qrCode,

        verified: false,

        result: 'EXPIRED',

      });
      return {
        approved: false,
        reason: 'EXPIRED',
      };
    }

    // Inventory Check

    const inventory =
      await this.prisma.inventory.aggregate({
        where: {
          batchId: batch.id,
        },

        _sum: {
          quantity: true,
        },
      });

    if (
      !inventory._sum.quantity ||
      inventory._sum.quantity <= 0
    ) {
      await this.scanHistoryService.create({
        userId,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        qrCode: dto.qrCode,
        verified: false,
        result: 'OUT_OF_STOCK',
      });

      return {
        approved: false,
        reason: 'OUT_OF_STOCK',
      };
    }

    await this.scanHistoryService.create({
      userId,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      qrCode: dto.qrCode,
      verified: true,
      result: 'APPROVED',
    });

    return {
      approved: true,
      message: 'Sale Approved',
      batchNumber: batch.batchNumber,
    };
  }
}