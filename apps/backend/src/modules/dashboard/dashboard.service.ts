import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
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

    const revokedBatches =
      await this.prisma.batch.count({
        where: {
          status: 'REVOKED',
        },
      });

    const activeRecalls =
      await this.prisma.recall.count({
        where: {
          status: 'ACTIVE',
        },
      });

    const inventory =
      await this.prisma.inventory.aggregate({
        _sum: {
          quantity: true,
        },
      });

    const notifications =
      await this.prisma.notification.count({
        where: {
          isRead: false,
        },
      });

    return {
      totalBatches,
      activeBatches,
      revokedBatches,
      activeRecalls,

      inventoryUnits:
        inventory._sum.quantity || 0,

      notifications,
    };
  }
}