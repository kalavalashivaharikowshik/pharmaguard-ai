import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../infra/cache.service';

const DAY = 86_400_000;

/** Map-based stock visibility and safety / performance KPIs. */
@Injectable()
export class SafetyAnalyticsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Stock by organisation with coordinates, for the map view.
   * Optional recallId highlights only holders of the recalled batch.
   */
  async stockMap(recallId?: string) {
    return this.cache.wrap(`analytics:map:${recallId ?? 'all'}`, 60, async () => {
      let batchFilter: string | undefined;
      if (recallId) {
        const recall = await this.prisma.recall.findUnique({ where: { id: recallId }, select: { batchId: true } });
        batchFilter = recall?.batchId;
      }

      const inventory = await this.prisma.inventory.findMany({
        where: { quantity: { gt: 0 }, ...(batchFilter ? { batchId: batchFilter } : {}) },
        include: { batch: { select: { batchNumber: true, drugName: true, status: true, expiryDate: true } } },
      });
      const owners = await this.prisma.user.findMany({
        where: { id: { in: [...new Set(inventory.map((i) => i.ownerUserId))] } },
        select: { id: true, fullName: true, organizationName: true, role: true, city: true, latitude: true, longitude: true },
      });
      const byOwner = new Map(owners.map((o) => [o.id, o]));

      const points = new Map<string, any>();
      for (const item of inventory) {
        const o = byOwner.get(item.ownerUserId);
        if (!o) continue;
        const p = points.get(o.id) ?? {
          userId: o.id,
          organization: o.organizationName ?? o.fullName,
          role: o.role,
          city: o.city,
          latitude: o.latitude,
          longitude: o.longitude,
          totalUnits: 0,
          atRiskUnits: 0,
          batches: [] as any[],
        };
        p.totalUnits += item.quantity;
        const unsafe = item.batch.status !== 'ACTIVE' && item.batch.status !== 'TRANSFERRED';
        const expiringSoon = item.batch.expiryDate.getTime() - Date.now() < 30 * DAY;
        if (unsafe || expiringSoon) p.atRiskUnits += item.quantity;
        p.batches.push({
          batchNumber: item.batch.batchNumber,
          drugName: item.batch.drugName,
          status: item.batch.status,
          quantity: item.quantity,
        });
        points.set(o.id, p);
      }

      const all = [...points.values()];
      return {
        points: all.filter((p) => p.latitude != null && p.longitude != null),
        withoutLocation: all.filter((p) => p.latitude == null || p.longitude == null).length,
      };
    });
  }

  /** Recall, compliance, supply-chain and counterfeit-prevention metrics. */
  async safetyMetrics() {
    return this.cache.wrap('analytics:safety', 60, async () => {
      const since = new Date(Date.now() - 30 * DAY);
      const [recalls, tasks, violations, violations30, disposals, scans, failedScans, transfers, inventoryHolders, usersWithLocation] =
        await Promise.all([
          this.prisma.recall.findMany({ select: { status: true, createdAt: true, completedAt: true } }),
          this.prisma.recallTask.groupBy({ by: ['status'], _count: { _all: true } }),
          this.prisma.violation.groupBy({ by: ['type'], _count: { _all: true } }),
          this.prisma.violation.count({ where: { createdAt: { gte: since } } }),
          this.prisma.disposalRecord.groupBy({ by: ['status'], _count: { _all: true } }),
          this.prisma.scanHistory.count(),
          this.prisma.scanHistory.count({ where: { verified: false } }),
          this.prisma.batchTransfer.findMany({ where: { status: 'COMPLETED' }, select: { createdAt: true } }),
          this.prisma.inventory.findMany({ where: { quantity: { gt: 0 } }, select: { ownerUserId: true }, distinct: ['ownerUserId'] }),
          this.prisma.user.count({ where: { latitude: { not: null } } }),
        ]);

      const completed = recalls.filter((r) => r.status === 'COMPLETED' && r.completedAt);
      const avgHours = completed.length
        ? completed.reduce((s, r) => s + (r.completedAt!.getTime() - r.createdAt.getTime()), 0) / completed.length / 3_600_000
        : null;
      const taskCount = (s: string) => tasks.find((t) => t.status === s)?._count._all ?? 0;
      const totalTasks = tasks.reduce((n, t) => n + t._count._all, 0);
      const dCount = (s: string) => disposals.find((d) => d.status === s)?._count._all ?? 0;
      const totalDisposals = disposals.reduce((n, d) => n + d._count._all, 0);

      return {
        recallPerformance: {
          totalRecalls: recalls.length,
          activeRecalls: recalls.filter((r) => r.status === 'ACTIVE').length,
          completedRecalls: completed.length,
          averageCompletionHours: avgHours === null ? null : Math.round(avgHours * 10) / 10,
          taskCompletionRate: totalTasks ? Math.round((taskCount('COMPLETED') / totalTasks) * 100) : null,
          overdueTasks: taskCount('OVERDUE'),
        },
        compliance: {
          violationsTotal: violations.reduce((n, v) => n + v._count._all, 0),
          violationsLast30Days: violations30,
          byType: Object.fromEntries(violations.map((v) => [v.type, v._count._all])),
          disposalCompletionRate: totalDisposals ? Math.round(((dCount('DESTROYED') + dCount('RETURNED')) / totalDisposals) * 100) : null,
          pendingDisposals: dCount('NOTICE_ISSUED'),
        },
        supplyChain: {
          completedTransfers: transfers.length,
          transfersLast30Days: transfers.filter((t) => t.createdAt >= since).length,
          activeStockHolders: inventoryHolders.length,
          inventoryVisibilityScore: inventoryHolders.length
            ? Math.min(100, Math.round((usersWithLocation / Math.max(inventoryHolders.length, 1)) * 100))
            : 100,
        },
        counterfeitPrevention: {
          verificationScans: scans,
          suspiciousDetections: failedScans,
          detectionRate: scans ? Math.round((failedScans / scans) * 1000) / 10 : 0,
        },
      };
    });
  }
}
