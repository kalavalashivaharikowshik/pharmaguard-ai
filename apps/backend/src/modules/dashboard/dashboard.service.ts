import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

const DAY = 86_400_000;

/**
 * Role-based dashboard summary.
 *  - Super Admin / Regulator: whole network
 *  - Manufacturer: own batches and own stock
 *  - Distributor / Pharmacy / Hospital: own stock only
 * Field names are unchanged so existing web and mobile screens keep working.
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, role: string) {
    const oversight = role === 'SUPER_ADMIN' || role === 'REGULATOR';
    let batchWhere: Record<string, unknown> = {};
    let inventoryWhere: Record<string, unknown> = {};

    if (!oversight) {
      inventoryWhere = { ownerUserId: userId };
      if (role === 'MANUFACTURER') {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { manufacturerId: true } });
        batchWhere = { manufacturerId: user?.manufacturerId ?? '__none__' };
      } else {
        const held = await this.prisma.inventory.findMany({ where: { ownerUserId: userId }, select: { batchId: true } });
        batchWhere = { id: { in: [...new Set(held.map((h) => h.batchId))] } };
      }
    }

    const soon = new Date(Date.now() + 30 * DAY);
    const [totalBatches, activeBatches, revokedBatches, activeRecalls, inventory, notifications, expiringSoon, pendingRecallTasks, pendingDisposals, recentTransfers, recentRecalls] =
      await Promise.all([
        this.prisma.batch.count({ where: batchWhere }),
        this.prisma.batch.count({ where: { ...batchWhere, status: 'ACTIVE' } }),
        this.prisma.batch.count({ where: { ...batchWhere, status: 'REVOKED' } }),
        this.prisma.recall.count({ where: { status: 'ACTIVE', ...(oversight ? {} : { batch: batchWhere }) } }),
        this.prisma.inventory.aggregate({ where: inventoryWhere, _sum: { quantity: true } }),
        this.prisma.notification.count({ where: { userId, isRead: false } }),
        this.prisma.batch.count({ where: { ...batchWhere, status: 'ACTIVE', expiryDate: { lte: soon, gt: new Date() } } }),
        this.prisma.recallTask.count({ where: oversight ? { status: { not: 'COMPLETED' } } : { userId, status: { not: 'COMPLETED' } } }),
        this.prisma.disposalRecord.count({ where: { status: 'NOTICE_ISSUED', ...(oversight ? {} : { userId }) } }),
        this.prisma.batchTransfer.findMany({
          where: oversight ? {} : { OR: [{ fromUserId: userId }, { toUserId: userId }] },
          include: {
            batch: { select: { batchNumber: true, drugName: true } },
            fromUser: { select: { fullName: true, organizationName: true } },
            toUser: { select: { fullName: true, organizationName: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        this.prisma.recall.findMany({
          where: oversight ? {} : { batch: batchWhere },
          include: { batch: { select: { batchNumber: true, drugName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    return {
      scope: oversight ? 'NETWORK' : 'ORGANISATION',
      totalBatches,
      activeBatches,
      revokedBatches,
      activeRecalls,
      inventoryUnits: inventory._sum.quantity || 0,
      notifications,
      expiringSoon,
      pendingRecallTasks,
      pendingDisposals,
      recentTransfers,
      recentRecalls,
    };
  }
}
