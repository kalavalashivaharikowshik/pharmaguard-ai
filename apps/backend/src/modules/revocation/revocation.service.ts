import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  NotificationType,
  NotificationPriority,
} from '@prisma/client';

import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RevocationService {
  constructor(
    private prisma: PrismaService,

    private notificationsService: NotificationsService,

    private auditService: AuditService,
  ) {}

  async revokeBatch(
    batchId: string,
    reason: string,
  ) {
    const batch =
      await this.prisma.batch.findUnique({
        where: {
          id: batchId,
        },
      });

    if (!batch) {
      throw new NotFoundException(
        'Batch not found',
      );
    }

    if (
      batch.status === 'REVOKED'
    ) {

      return batch;

    }

    const revokedBatch =
      await this.prisma.batch.update({

        where: {
          id: batchId,
        },

        data: {
          status: 'REVOKED',

          revokedAt: new Date(),

          revocationReason: reason,
        },

      });

      let title = 'Batch Revoked';

      let message =
        `${revokedBatch.drugName} (${revokedBatch.batchNumber}) has been revoked due to ${reason}.`;

      if (reason === 'EXPIRED') {

        title = 'Batch Expired';

        message =
          `${revokedBatch.drugName} (${revokedBatch.batchNumber}) has expired and has been removed from circulation.`;

      }

      else if (reason === 'TAMPER_DETECTED') {

        title = 'Batch Tampered';

        message =
          `${revokedBatch.drugName} (${revokedBatch.batchNumber}) failed blockchain verification and has been revoked.`;

      }

      else if (reason === 'RECALL_COMPLETED') {

        title = 'Recall Completed';

        message =
          `${revokedBatch.drugName} (${revokedBatch.batchNumber}) recall process has been completed and the batch has been revoked.`;

      }

      const inventory =
        await this.prisma.inventory.findMany({

          where: {

            batchId,

          },

        });

      const manufacturerUsers =
        await this.prisma.user.findMany({

          where: {

            manufacturerId:
              batch.manufacturerId,

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

        await this.notificationsService.createNotification({

          userId: user.id,

          title,

          message,

          type: NotificationType.REVOCATION,

          priority: NotificationPriority.CRITICAL,

          actionUrl: '/inventory',

          metadata: {

            batchId: revokedBatch.id,

            batchNumber: revokedBatch.batchNumber,

            reason,

          },

        });

      }

      await this.auditService.log({

      action: 'BATCH_REVOKED',

      entity: 'BATCH',

      entityId: revokedBatch.id,

      description: `Batch ${revokedBatch.batchNumber} was revoked.`,

      metadata: {

        batchNumber: revokedBatch.batchNumber,

        drugName: revokedBatch.drugName,

        reason,

      },

    });
      return revokedBatch;
  }
  
  async getRevokedBatches() {
    return this.prisma.batch.findMany({
        where: {
        status: 'REVOKED',
        },

        orderBy: {
        revokedAt: 'desc',
        },

        select: {
        id: true,

        drugName: true,

        batchNumber: true,

        revokedAt: true,

        revocationReason: true,

        manufacturerId: true,
        },
    });
  }

  async getSummary() {

    const revokedBatches =
      await this.prisma.batch.count({
        where: {
          status: 'REVOKED',
        },
      });

    const expired =
      await this.prisma.batch.count({
        where: {
          revocationReason: 'EXPIRED',
        },
      });

    const tampered =
      await this.prisma.batch.count({
        where: {
          revocationReason:
            'TAMPER_DETECTED',
        },
      });

    const recalled =
      await this.prisma.batch.count({
        where: {
          revocationReason:
            'RECALL_COMPLETED',
        },
      });

    return {
      revokedBatches,
      expired,
      tampered,
      recalled,
    };
  }
}
