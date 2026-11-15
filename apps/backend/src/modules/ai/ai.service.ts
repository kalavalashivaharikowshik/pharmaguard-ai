import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RecallAgentService } from './recall-agent.service';

/** Recall tasks and impact queries used by the AI recall workflow. */
@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private recallAgent: RecallAgentService,
  ) {}

  async getRecallImpact(recallId: string) {
    const recall = await this.prisma.recall.findUnique({ where: { id: recallId }, include: { batch: true } });
    if (!recall) throw new NotFoundException('Recall not found');

    const holdings = await this.prisma.inventory.findMany({
      where: { batchId: recall.batchId, quantity: { gt: 0 } },
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: holdings.map((h) => h.ownerUserId) } },
      select: { id: true, fullName: true, organizationName: true, role: true, city: true, latitude: true, longitude: true },
    });
    const tasks = await this.prisma.recallTask.findMany({ where: { recallId } });
    const byUser = new Map(users.map((u) => [u.id, u]));
    const taskByUser = new Map(tasks.map((t) => [t.userId, t]));

    const locations = holdings.map((h) => {
      const u = byUser.get(h.ownerUserId);
      const t = taskByUser.get(h.ownerUserId);
      return {
        userId: h.ownerUserId,
        organization: u?.organizationName ?? u?.fullName,
        role: u?.role,
        city: u?.city,
        latitude: u?.latitude,
        longitude: u?.longitude,
        quantity: h.quantity,
        taskStatus: t?.status ?? 'NO_TASK',
      };
    });

    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    return {
      recallId,
      recallNumber: recall.recallNumber,
      batchNumber: recall.batch.batchNumber,
      affectedOrganizations: holdings.length,
      affectedUnits: holdings.reduce((n, h) => n + h.quantity, 0),
      tasks: { total: tasks.length, completed, overdue: tasks.filter((t) => t.status === 'OVERDUE').length },
      progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      dueDate: recall.dueDate,
      locations,
    };
  }

  async getRecallSummary(recallId: string) {
    const recall = await this.prisma.recall.findUnique({ where: { id: recallId } });
    if (!recall) throw new NotFoundException('Recall not found');
    if (!recall.aiSummary) {
      const result = await this.recallAgent.run(recallId);
      return { summary: result.summary ?? '', usedLlm: !!result.usedLlm };
    }
    return { summary: recall.aiSummary };
  }

  listRecallTasks(recallId: string) {
    return this.prisma.recallTask.findMany({
      where: { recallId },
      include: { user: { select: { id: true, fullName: true, organizationName: true, role: true, city: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  myTasks(userId: string) {
    return this.prisma.recallTask.findMany({
      where: { userId },
      include: { recall: { include: { batch: { select: { id: true, batchNumber: true, drugName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeTask(taskId: string, userId: string, role: string, notes?: string) {
    const task = await this.prisma.recallTask.findUnique({ where: { id: taskId }, include: { recall: true } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId && role !== 'SUPER_ADMIN' && role !== 'REGULATOR') {
      throw new ForbiddenException('You can only complete your own recall tasks.');
    }

    const updated = await this.prisma.recallTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date(), notes },
    });

    // Stock stays quarantined in inventory (sales are already blocked because the
    // batch is RECALLED). When the recall is finalised the batch is revoked and
    // every holder receives a return/disposal notice to remove it for good.

    await this.audit.log({
      userId,
      action: 'RECALL_TASK_COMPLETED',
      entity: 'RECALL',
      entityId: task.recallId,
      description: `Recall task completed for recall ${task.recall.recallNumber}.`,
      metadata: { taskId, notes },
    });

    // Finalise immediately when this was the last open task.
    const open = await this.prisma.recallTask.count({
      where: { recallId: task.recallId, status: { not: 'COMPLETED' } },
    });
    let recallCompleted = false;
    if (open === 0 && task.recall.status === 'ACTIVE') {
      await this.recallAgent.finalize(task.recallId);
      recallCompleted = true;
    }

    return { ...updated, recallCompleted };
  }

  async finalizeRecall(recallId: string) {
    const recall = await this.prisma.recall.findUnique({ where: { id: recallId }, include: { tasks: true } });
    if (!recall) throw new NotFoundException('Recall not found');
    if (recall.status === 'COMPLETED') return { message: 'Recall already completed' };
    if (recall.tasks.some((t) => t.status !== 'COMPLETED')) {
      return { message: 'Recall tasks still pending' };
    }
    await this.recallAgent.finalize(recallId);
    return { message: 'Recall finalized and batch revoked' };
  }
}
