import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ethers } from 'ethers';

import { PrismaService } from '../../prisma/prisma.service';
import { BatchRegistryABI } from './abi';
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

  private contract;

  constructor(
    private prisma: PrismaService,

    private revocationService:
    RevocationService,

    private notificationsService:
    NotificationsService,

    private auditService: AuditService,
  ) {

    const provider =
      new ethers.providers.JsonRpcProvider(
        process.env.BLOCKCHAIN_RPC_URL,
      );

    const wallet =
      new ethers.Wallet(
        process.env.BLOCKCHAIN_PRIVATE_KEY!,
        provider,
      );

    this.contract =
      new ethers.Contract(
        process.env.BLOCKCHAIN_CONTRACT_ADDRESS!,
        BatchRegistryABI,
        wallet,
      );
  }

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

    const tx =
      await this.contract.registerBatch(
        batchNumber,
        batchHash,
      );

    const receipt =
      await tx.wait();

    await this.auditService.log({

      action: 'BLOCKCHAIN_REGISTERED',

      entity: 'BATCH',

      entityId: batchNumber,

      description: `Batch ${batchNumber} registered on blockchain.`,

      metadata: {

        batchNumber,

        transactionHash: receipt.transactionHash,

      },

    });

    return {
      txHash:
        receipt.transactionHash,
    };

  }
  async getBatch(
    batchNumber: string,
  ) {
    try {

      const batch =
        await this.contract.getBatch(
          batchNumber,
        );

      return {
        batchNumber: batch[0],
        batchHash: batch[1],
        registeredAt: Number(batch[2]),
      };

    } catch {

      return {
        batchNumber,
        batchHash: '',
        registeredAt: 0,
      };

    }
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
      
      batch: dbBatch,
    };
  }
}
