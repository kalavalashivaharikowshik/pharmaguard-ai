import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  NotificationType,
  NotificationPriority,
} from '@prisma/client';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ComplianceService {
  constructor(
    private prisma: PrismaService,

    private notificationsService: NotificationsService,
  ) {}

  async getSummary() {
    const totalBatches =
      await this.prisma.batch.count();

    const activeBatches =
      await this.prisma.batch.count({
        where: {
          status: 'ACTIVE',
        },
      });

    const recalledBatches =
      await this.prisma.batch.count({
        where: {
          status: 'RECALLED',
        },
      });

    const totalTransfers =
      await this.prisma.batchTransfer.count();

    const totalRecalls =
      await this.prisma.recall.count();

    const complianceScore =
      totalBatches === 0
        ? 100
        : Number(
            (
              (activeBatches / totalBatches) *
              100
            ).toFixed(1),
          );

    let riskLevel = 'LOW';

    if (recalledBatches >= 5) {

      riskLevel = 'HIGH';

    } else if (

      recalledBatches >= 2

    ) {

      riskLevel = 'MEDIUM';

    }

    if (

      complianceScore < 90 ||

      riskLevel !== 'LOW'

    ) {

      const recipients =
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

      for (const user of recipients) {

        const alreadyExists =
          await this.prisma.notification.findFirst({

            where: {

              userId: user.id,

              type: NotificationType.COMPLIANCE,

              title: 'Compliance Risk Detected',

              isRead: false,

            },

          });

        if (!alreadyExists) {

          await this.notificationsService.createNotification({

            userId: user.id,

            title: 'Compliance Risk Detected',

            message:
              `Compliance score is ${complianceScore}% (${riskLevel} risk).`,

            type: NotificationType.COMPLIANCE,

            priority: NotificationPriority.HIGH,

            actionUrl: '/compliance',

            metadata: {

              complianceScore,

              riskLevel,

            },

          });

        }

  }
  

}
  

    return {

      totalBatches,

      activeBatches,

      recalledBatches,

      totalTransfers,

      totalRecalls,

      complianceScore,

      riskLevel,

    };
    
  }

  private async notifyReportGenerated(
    reportType: string,
  ) {

    const recipients =
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

    for (const user of recipients) {

      const existing =
        await this.prisma.notification.findFirst({

          where: {

            userId: user.id,

            type: NotificationType.COMPLIANCE,

            title: 'Compliance Report Generated',

            isRead: false,

            metadata: {

              path: ['reportType'],

              equals: reportType,

            },

          },

        });

      if (existing) {
        continue;
      }

      await this.notificationsService.createNotification({

        userId: user.id,

        title: 'Compliance Report Generated',

        message:
          `${reportType} report has been generated.`,

        type: NotificationType.COMPLIANCE,

        priority: NotificationPriority.LOW,

        actionUrl: '/compliance',

        metadata: {

          reportType,

        },

      });

    }

  }

  async getRecallReport() {

    await this.notifyReportGenerated(
      'Recall',
    );

    return this.prisma.recall.findMany({
      include: {
        batch: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

  }

  async getExpiryReport() {

    await this.notifyReportGenerated(
    'Expiry',
  );
    const now = new Date();

    return this.prisma.batch.findMany({
      where: {
        expiryDate: {
          lt: now,
        },
      },

      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  async getTransferReport() {

    await this.notifyReportGenerated(
      'Transfer',
    );
    return this.prisma.batchTransfer.findMany({
      include: {
        batch: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}