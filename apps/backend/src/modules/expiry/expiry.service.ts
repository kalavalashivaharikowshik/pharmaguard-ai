import { Injectable } from '@nestjs/common';

import {
  NotificationType,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { RevocationService } from '../revocation/revocation.service';

import { NotificationsService } from '../notifications/notifications.service';

import {
  NotificationPriority,
} from '@prisma/client';

@Injectable()
export class ExpiryService {
  constructor(
    private prisma: PrismaService,

    private revocationService:
      RevocationService,

    private notificationsService:
      NotificationsService,
  ) {}

  async checkExpiringBatches() {

  const now = new Date();

  const threshold = new Date();

  threshold.setDate(
    threshold.getDate() + 30,
  );

  let notificationsCreated = 0;

  /**
   * Expiring in next 30 days
   */
  const batches =
    await this.prisma.batch.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          lte: threshold,
          gt: now,
        },
      },
    });

  /**
   * Already expired
   */
  const expiredBatches =
    await this.prisma.batch.findMany({
      where: {
        expiryDate: {
          lt: now,
        },
        status: {
          not: 'REVOKED',
        },
      },
    });

  /**
   * Auto revoke expired batches
   */
  for (const batch of expiredBatches) {

    await this.revocationService.revokeBatch(
      batch.id,
      'EXPIRED',
    );

  }

  /**
   * Expiry notifications
   */
  for (const batch of batches) {

    const daysRemaining =
      Math.ceil(
        (
          batch.expiryDate.getTime() -
          now.getTime()
        ) /
        (1000 * 60 * 60 * 24),
      );

    let priority: NotificationPriority =
      NotificationPriority.MEDIUM;
    if (daysRemaining <= 7) {

      priority =
        NotificationPriority.HIGH;

    }

    if (daysRemaining <= 0) {

      priority =
        NotificationPriority.CRITICAL;

    }

    const inventories =
      await this.prisma.inventory.findMany({
        where: {
          batchId: batch.id,
        },
      });

    for (const inventory of inventories) {

      const existing =
        await this.prisma.notification.findFirst({
          where: {

            userId:
              inventory.ownerUserId,

            type:
              NotificationType.EXPIRY,

            isRead: false,

            metadata: {
              path: ['batchId'],
              equals: batch.id,
            },

            priority,

          },

        });

      if (existing) {

        continue;

      }

      await this.notificationsService.createNotification({

        userId:
          inventory.ownerUserId,

        title:
          'Batch Expiring Soon',

        message:
          `${batch.batchNumber} expires in ${daysRemaining} day(s).`,

        type:
          NotificationType.EXPIRY,

        priority,

        actionUrl:
          '/inventory',

        metadata: {

          batchId:
            batch.id,

          batchNumber:
            batch.batchNumber,

          daysRemaining,

        },

      });

      notificationsCreated++;

    }

  }

  return {

    checked:
      batches.length,

    notificationsCreated,

    revoked:
      expiredBatches.length,

  };

}
}