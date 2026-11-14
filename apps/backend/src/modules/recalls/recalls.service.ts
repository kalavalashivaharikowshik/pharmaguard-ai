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

@Injectable()
export class RecallsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
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

    const recall =
      await this.prisma.recall.create({
        data: {
          recallNumber:
            dto.recallNumber,

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

    return recall;
  }

  findAll() {
    return this.prisma.recall.findMany({
      include: {
        batch: true,
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