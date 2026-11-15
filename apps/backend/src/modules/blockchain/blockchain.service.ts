import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { ChainService } from '../chain/chain.service';
import { ViolationsService } from '../infra/violations.service';

import { PrismaService } from '../../prisma/prisma.service';
import { RevocationService }
from '../revocation/revocation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

import {
  NotificationPriority,
  NotificationType,
} from '@prisma/client';

@Injectable()
export class BlockchainService {

  constructor(
    private prisma: PrismaService,

    private revocationService:
    RevocationService,

    private notificationsService:
    NotificationsService,

    private auditService: AuditService,

    private chain: ChainService,

    private violations: ViolationsService,
  ) {}

  async generateBatchHash(
    batch: any,
  ) {

    const payload =
      JSON.stringify({
        batchNumber:
          batch.batchNumber,

        drugName:
          batch.drugName,

        manufactureDate:
          batch.manufactureDate,

        expiryDate:
          batch.expiryDate,

        quantity:
          batch.quantity,
      });

    return ethers.utils.id(
      payload,
    );
  }

  async registerBatch(
    batchNumber: string,
    batchHash: string,
  ) {

    const transactionHash =
      await this.chain.registerBatch(
        batchNumber,
        batchHash,
      );

    if (!transactionHash) {
      return { txHash: null };
    }

    await this.auditService.log({

      action: 'BLOCKCHAIN_REGISTERED',

      entity: 'BATCH',

      entityId: batchNumber,

      description: `Batch ${batchNumber} registered on blockchain.`,

      metadata: {

        batchNumber,

        transactionHash,

      },

    });

    return {
      txHash:
        transactionHash,
    };

  }
  async getBatch(
    batchNumber: string,
  ) {
    return this.chain.getBatch(batchNumber);
  }

  async getStats() {
    return this.chain.stats();
  }

  async verifyBatch(
    batchNumber: string,
  ) {

    const dbBatch =
      await this.prisma.batch.findUnique({
        where: {
          batchNumber,
        },
        include: {
          manufacturer: true,
          recalls: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      });

    if (!dbBatch) {
      throw new BadRequestException(
        'Batch not found',
      );
    }

    // Blockchain not configured (e.g. a demo without Sepolia keys): report it
    // clearly instead of treating every batch as tampered.
    if (!this.chain.enabled) {
      return {
        batchNumber,
        verified: false,
        currentHash: await this.generateBatchHash(dbBatch),
        blockchainHash: '',
        action: 'BLOCKCHAIN_DISABLED',
        revokedOnChain: false,
        revocationReason: dbBatch.revocationReason,
        network: this.chain.network,
        contractAddress: undefined,
        batch: dbBatch,
      };
    }

    const chainBatch =
      await this.getBatch(
        batchNumber,
      );

    const currentHash =
      await this.generateBatchHash(
        dbBatch,
      );

    if (!chainBatch.batchHash) {

      return {

        batchNumber,

        verified: false,

        currentHash,

        blockchainHash: '',

        action: 'NOT_REGISTERED',

        batch: dbBatch,

      };

    }

    const verified =
      currentHash ===
      chainBatch.batchHash;
    
      if (verified) {

      await this.auditService.log({

        action: 'BLOCKCHAIN_VERIFIED',

        entity: 'BATCH',

        entityId: dbBatch.id,

        description: `Blockchain verification succeeded for batch ${dbBatch.batchNumber}.`,

        metadata: {

          batchNumber: dbBatch.batchNumber,

        },

      });

    }

    if (!verified) {

      if (
        dbBatch.status !==
        'REVOKED'
      ) {

      const manufacturerUsers =
        await this.prisma.user.findMany({

          where: {

            manufacturerId:
              dbBatch.manufacturerId,

          },

        });

      const admins =
        await this.prisma.user.findMany({

          where: {

            role: {

              in: [

                'SUPER_ADMIN',

                'REGULATOR',

              ],

            },

          },

        });

      const inventory =
        await this.prisma.inventory.findMany({

          where: {

            batchId: dbBatch.id,

          },

        });

      const inventoryOwners =
        await this.prisma.user.findMany({

          where: {

            id: {

              in: inventory.map(

                i => i.ownerUserId,

              ),

            },

          },

        });

      const users = [

        ...manufacturerUsers,

        ...admins,

        ...inventoryOwners,

      ];

      const uniqueUsers =
        [...new Map(

          users.map(

            user => [

              user.id,

              user,

            ],

          ),

        ).values()];

      for (const user of uniqueUsers) {

        const alreadyExists =
          await this.prisma.notification.findFirst({

            where: {

              userId: user.id,

              type: NotificationType.BLOCKCHAIN,

              title:
                'Blockchain Verification Failed',

              isRead: false,

            },

          });

        if (!alreadyExists) {

          await this.notificationsService.createNotification({

            userId: user.id,

            title:
              'Blockchain Verification Failed',

            message:
              `Integrity verification failed for batch ${dbBatch.batchNumber}. Immediate investigation required.`,

            type:
              NotificationType.BLOCKCHAIN,

            priority:
              NotificationPriority.CRITICAL,

            actionUrl:
              '/inventory',

            metadata: {

              batchId:
                dbBatch.id,

              batchNumber:
                dbBatch.batchNumber,

            },

          });

        }

      }
      await this.auditService.log({

    action: 'BLOCKCHAIN_VERIFICATION_FAILED',

    entity: 'BATCH',

    entityId: dbBatch.id,

    description: `Blockchain verification failed for batch ${dbBatch.batchNumber}.`,

    metadata: {

      batchNumber: dbBatch.batchNumber,

      expectedHash: currentHash,

      blockchainHash: chainBatch.batchHash,

    },

  });

        await this.violations.record({
          type: 'TAMPER_DETECTED',
          severity: 'CRITICAL',
          description: `Batch ${dbBatch.batchNumber} data no longer matches its blockchain fingerprint.`,
          batchId: dbBatch.id,
          metadata: {
            expectedHash: chainBatch.batchHash,
            currentHash,
          },
        });

        await this.revocationService
          .revokeBatch(
            dbBatch.id,
            'TAMPER_DETECTED',
          );
      }
    }

    return {
      batchNumber,

      verified,

      currentHash,

      blockchainHash:
        chainBatch.batchHash,

      action:
        verified
          ? 'NONE'
          : 'BATCH_REVOKED',

      revokedOnChain:
        !!chainBatch.revoked,

      revocationReason:
        chainBatch.revocationReason || dbBatch.revocationReason,

      network:
        this.chain.network,

      contractAddress:
        this.chain.contractAddress,
      
      batch: dbBatch,
    };
  }
}
