import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { UpdateDisposalDto } from './dto/update-disposal.dto';

const REASON_LABEL: Record<string, string> = {
  EXPIRED: 'it has expired',
  RECALL_COMPLETED: 'its recall was completed',
  TAMPER_DETECTED: 'blockchain tampering was detected',
};

/**
 * Expired stock return & disposal management.
 *
 * When a batch is revoked, every organisation still holding units receives a
 * return/disposal notice. They then mark the stock as RETURNED or DESTROYED
 * (with evidence). Once every holder has destroyed it, the batch becomes
 * DESTROYED and has fully left the supply chain.
 */
@Injectable()
export class DisposalService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private audit: AuditService,
  ) {}

  async issueNotices(batchId: string, reason: string) {
    const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) return { created: 0 };

    const holdings = await this.prisma.inventory.findMany({
      where: { batchId, quantity: { gt: 0 } },
    });

    let created = 0;
    for (const h of holdings) {
      const existing = await this.prisma.disposalRecord.findUnique({
        where: { batchId_userId: { batchId, userId: h.ownerUserId } },
      });
      if (existing) continue;

      await this.prisma.disposalRecord.create({
        data: { batchId, userId: h.ownerUserId, quantity: h.quantity, reason },
      });
      created++;

      await this.notifications.createNotification({
        userId: h.ownerUserId,
        title: 'Return / Disposal Notice',
        message: `Return or destroy ${h.quantity} units of ${batch.drugName} (${batch.batchNumber}) because ${REASON_LABEL[reason] ?? reason}.`,
        type: 'COMPLIANCE',
        priority: 'HIGH',
        actionUrl: '/disposals',
        metadata: { batchId, batchNumber: batch.batchNumber, reason },
      });
    }
    return { created };
  }

  findAll(userId: string, role: string) {
    const all = role === 'SUPER_ADMIN' || role === 'REGULATOR';
    return this.prisma.disposalRecord.findMany({
      where: all ? {} : { userId },
      include: {
        batch: { select: { id: true, batchNumber: true, drugName: true, expiryDate: true, status: true } },
        user: { select: { id: true, fullName: true, organizationName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async summary(userId: string, role: string) {
    const all = role === 'SUPER_ADMIN' || role === 'REGULATOR';
    const where = all ? {} : { userId };
    const grouped = await this.prisma.disposalRecord.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
      _sum: { quantity: true },
    });
    const get = (s: string) => grouped.find((g) => g.status === s);
    const total = grouped.reduce((n, g) => n + g._count._all, 0);
    const destroyed = get('DESTROYED')?._count._all ?? 0;
    return {
      total,
      pending: get('NOTICE_ISSUED')?._count._all ?? 0,
      returned: get('RETURNED')?._count._all ?? 0,
      destroyed,
      unitsPending: get('NOTICE_ISSUED')?._sum.quantity ?? 0,
      completionRate: total ? Math.round(((destroyed + (get('RETURNED')?._count._all ?? 0)) / total) * 100) : 100,
    };
  }

  async update(id: string, dto: UpdateDisposalDto, userId: string, role: string) {
    const record = await this.prisma.disposalRecord.findUnique({ where: { id }, include: { batch: true } });
    if (!record) throw new NotFoundException('Disposal record not found');

    if (record.userId !== userId && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You can only update your own disposal records.');
    }
    if (record.status === 'DESTROYED') {
      throw new BadRequestException('This stock has already been destroyed.');
    }

    const updated = await this.prisma.disposalRecord.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes,
        evidence: dto.evidence,
        completedAt: new Date(),
      },
    });

    // Unsafe stock leaves the holder's inventory once returned or destroyed.
    await this.prisma.inventory.updateMany({
      where: { batchId: record.batchId, ownerUserId: record.userId },
      data: { quantity: 0 },
    });

    await this.audit.log({
      userId,
      action: `DISPOSAL_${dto.status}`,
      entity: 'BATCH',
      entityId: record.batchId,
      description: `${record.quantity} units of ${record.batch.batchNumber} marked ${dto.status.toLowerCase()}.`,
      metadata: { disposalId: id, evidence: dto.evidence, notes: dto.notes },
    });

    const remaining = await this.prisma.disposalRecord.count({
      where: { batchId: record.batchId, status: { not: 'DESTROYED' } },
    });
    if (remaining === 0) {
      await this.prisma.batch.update({ where: { id: record.batchId }, data: { status: 'DESTROYED' } });
    }

    const oversight = await this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'REGULATOR'] }, status: 'ACTIVE' },
      select: { id: true },
    });
    for (const u of oversight) {
      await this.notifications.createNotification({
        userId: u.id,
        title: `Stock ${dto.status === 'DESTROYED' ? 'Destroyed' : 'Returned'}`,
        message: `${record.quantity} units of ${record.batch.batchNumber} were ${dto.status.toLowerCase()}.`,
        type: 'COMPLIANCE',
        priority: 'LOW',
        actionUrl: '/disposals',
        metadata: { batchId: record.batchId, disposalId: id },
      });
    }

    return updated;
  }
}
