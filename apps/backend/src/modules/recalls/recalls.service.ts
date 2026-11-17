import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  BatchStatus,
  RecallStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateRecallDto } from './dto/create-recall.dto';

import { NotificationsService } from '../notifications/notifications.service';

import { AuditService } from '../audit/audit.service';
import { RecallAgentService } from '../ai/recall-agent.service';
import { UpdateRecallDto } from './dto/create-recall.dto';

@Injectable()
export class RecallsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private recallAgent: RecallAgentService,
  ) {}

  async create(
    dto: CreateRecallDto,
  ) {
    const batch =
      await this.prisma.batch.findUnique({
        where: {
          id: dto.batchId,
        },
      });

    if (!batch) {
      throw new BadRequestException(
        'Batch not found',
      );
    }

    if (['REVOKED', 'DESTROYED', 'EXPIRED'].includes(batch.status)) {
      throw new BadRequestException(
        `Batch is already ${batch.status.toLowerCase()} and cannot be recalled.`,
      );
    }

    const active = await this.prisma.recall.findFirst({
      where: { batchId: dto.batchId, status: RecallStatus.ACTIVE },
    });
    if (active) {
      throw new BadRequestException(
        `Batch already has an active recall (${active.recallNumber}).`,
      );
    }

    const recallNumber =
      dto.recallNumber?.trim() ||
      `RCL-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const recall =
      await this.prisma.recall.create({
        data: {
          recallNumber,

          reason:
            dto.reason,

          severity:
            dto.severity,

          status:
            RecallStatus.ACTIVE,

          batchId:
            dto.batchId,
        },
      });

    await this.prisma.batch.update({
      where: {
        id: dto.batchId,
      },

      data: {
        status:
          BatchStatus.RECALLED,
      },
    });

    await this.notificationsService
      .createRecallNotifications(
        recall,
      );
    
    await this.auditService.log({

      action: 'RECALL_CREATED',

      entity: 'RECALL',

      entityId: recall.id,

      description: `Recall ${recall.recallNumber} created for batch ${batch.batchNumber}.`,

      metadata: {

        batchId: batch.id,

        batchNumber: batch.batchNumber,

        severity: recall.severity,

        reason: recall.reason,

      },

    });

    // Agentic AI workflow: locate stock, create tasks, notify holders, write summary.
    this.recallAgent.runInBackground(recall.id);

    return recall;
  }

  async update(
    id: string,
    dto: UpdateRecallDto,
    userId: string,
  ) {
    const recall = await this.prisma.recall.findUnique({ where: { id }, include: { batch: true } });
    if (!recall) {
      throw new BadRequestException('Recall not found');
    }

    if (dto.status === RecallStatus.COMPLETED && recall.status !== RecallStatus.COMPLETED) {
      await this.recallAgent.finalize(id);
    }

    const updated = await this.prisma.recall.update({
      where: { id },
      data: {
        reason: dto.reason ?? undefined,
        severity: dto.severity ?? undefined,
      },
      include: { batch: true },
    });

    await this.auditService.log({
      userId,
      action: 'RECALL_UPDATED',
      entity: 'RECALL',
      entityId: id,
      description: `Recall ${recall.recallNumber} updated.`,
      metadata: { before: { reason: recall.reason, severity: recall.severity, status: recall.status }, changes: dto },
    });

    // Notify everyone involved (same audience as recall creation).
    const holders = await this.prisma.inventory.findMany({ where: { batchId: recall.batchId }, select: { ownerUserId: true } });
    const others = await this.prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['SUPER_ADMIN', 'REGULATOR'] } },
          { manufacturerId: recall.batch.manufacturerId },
        ],
      },
      select: { id: true },
    });
    const ids = new Set([...holders.map((h) => h.ownerUserId), ...others.map((o) => o.id)]);
    for (const uid of ids) {
      await this.notificationsService.createNotification({
        userId: uid,
        title: 'Recall Updated',
        message: `Recall ${recall.recallNumber} for ${recall.batch.batchNumber} was updated${dto.severity ? ` (severity ${dto.severity})` : ''}${dto.status ? ` (status ${dto.status})` : ''}.`,
        type: 'RECALL',
        priority: (dto.severity ?? recall.severity) === 'CRITICAL' ? 'CRITICAL' : (dto.severity ?? recall.severity) === 'HIGH' ? 'HIGH' : 'MEDIUM',
        actionUrl: '/recalls',
        metadata: { recallId: id },
      });
    }

    return updated;
  }

  findAll() {
    return this.prisma.recall.findMany({
      include: {
        batch: true,
        tasks: { select: { status: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.recall.findUnique({
      where: { id },

      include: {
        batch: true,
      },
    });
  }

  async getSummary(
    id: string,
  ) {

    const recall =
      await this.prisma.recall.findUnique({
        where: {
          id,
        },

        include: {
          batch: true,
        },
      });

    if (!recall) {
      throw new BadRequestException(
        'Recall not found',
      );
    }

    const inventories =
      await this.prisma.inventory.findMany({
        where: {
          batchId:
            recall.batchId,
        },
      });

    const affectedOrganizations =
      inventories.length;

    const affectedUnits =
      inventories.reduce(
        (
          total,
          inventory,
        ) =>
          total +
          inventory.quantity,

        0,
      );

    return {
      summary:
        `Recall ${recall.recallNumber} affects ${affectedOrganizations} organizations holding ${affectedUnits} units of ${recall.batch.batchNumber}. Immediate recall action is recommended.`,
    };
  }
}