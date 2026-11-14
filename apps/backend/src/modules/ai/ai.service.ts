import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RecallTaskStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { RevocationService }
from '../revocation/revocation.service';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private revocationService:
    RevocationService,
  ) {}

  async createRecallTasks(
    recallId: string,
  ) {
    const recall =
      await this.prisma.recall.findUnique({
        where: {
          id: recallId,
        },

        include: {
          batch: true,
        },
      });

    if (!recall) {
      throw new NotFoundException(
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

    const tasks: any[] = [];

    for (const inventory of inventories) {
      const task =
        await this.prisma.recallTask.create({
          data: {
            recallId:
              recall.id,

            userId:
              inventory.ownerUserId,

            status:
              RecallTaskStatus.PENDING,
          },
        });

      tasks.push(task);
    }

    return {
      recallId,
      tasksCreated:
        tasks.length,
      tasks,
    };
  }

  async getRecallImpact(
    recallId: string,
  ) {
    const recall =
      await this.prisma.recall.findUnique({
        where: {
          id: recallId,
        },
      });

    if (!recall) {
      throw new NotFoundException(
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

    const affectedUnits =
      inventories.reduce(
        (sum, inventory) =>
          sum + inventory.quantity,
        0,
      );

    return {
      recallId,

      affectedOrganizations:
        inventories.length,

      affectedUnits,
    };
  }

  async generateRecallSummary(
    recallId: string,
  ) {
    const recall =
      await this.prisma.recall.findUnique({
        where: {
          id: recallId,
        },

        include: {
          batch: true,
        },
      });

    if (!recall) {
      throw new NotFoundException(
        'Recall not found',
      );
    }

    const impact =
      await this.getRecallImpact(
        recallId,
      );

    return {
      summary:
        `Recall ${recall.recallNumber} affects ${impact.affectedOrganizations} organizations holding ${impact.affectedUnits} units of ${recall.batch.batchNumber}. Immediate recall action is recommended.`,
    };
  }

  async completeTask(
    taskId: string,
  ) {
    return this.prisma.recallTask.update({
      where: {
        id: taskId,
      },

      data: {
        status:
          RecallTaskStatus.COMPLETED,
      },
    });
  }

  async finalizeRecall(
    recallId: string,
  ) {

    const recall =
      await this.prisma.recall.findUnique({
        where: {
          id: recallId,
        },
      });

    if (!recall) {
      throw new NotFoundException(
        'Recall not found',
      );
    }

    const tasks =
      await this.prisma.recallTask.findMany({
        where: {
          recallId,
        },
      });

    const allCompleted =
      tasks.every(
        task =>
          task.status ===
          RecallTaskStatus.COMPLETED,
      );

    if (!allCompleted) {
      return {
        message:
          'Recall tasks still pending',
      };
    }

    await this.revocationService
      .revokeBatch(
        recall.batchId,
        'RECALL_COMPLETED',
      );

    return {
      message:
        'Recall finalized and batch revoked',
    };
  }
}