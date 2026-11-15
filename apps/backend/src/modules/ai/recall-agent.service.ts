import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { RecallSeverity } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RevocationService } from '../revocation/revocation.service';
import { AuditService } from '../audit/audit.service';
import { ViolationsService } from '../infra/violations.service';
import { GeminiService } from './gemini.service';

/** Hours each holder has to act on a recall, by severity. */
export const RECALL_DEADLINE_HOURS: Record<RecallSeverity, number> = {
  CRITICAL: 24,
  HIGH: 48,
  MEDIUM: 72,
  LOW: 168,
};

type Holder = { userId: string; quantity: number; fullName: string; organizationName: string | null; role: string; city: string | null };

/**
 * Shared state passed between the agents of the recall workflow.
 */
const RecallState = Annotation.Root({
  recallId: Annotation<string>(),
  recall: Annotation<any>(),
  holders: Annotation<Holder[]>(),
  affectedUnits: Annotation<number>(),
  dueDate: Annotation<Date | null>(),
  tasksCreated: Annotation<number>(),
  notified: Annotation<number>(),
  summary: Annotation<string>(),
  usedLlm: Annotation<boolean>(),
  steps: Annotation<string[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),
});

type State = typeof RecallState.State;

/**
 * Agentic AI recall management, built as a LangGraph workflow:
 *
 *   Recall Agent → Inventory Agent → Compliance Agent → Notification Agent → Summary Agent
 *
 * - Recall Agent:       loads the recall and batch, confirms it is active.
 * - Inventory Agent:    locates every organisation holding affected stock.
 * - Compliance Agent:   creates a recall task per holder with a deadline based on severity.
 * - Notification Agent: tells each holder what to do and by when.
 * - Summary Agent:      writes an executive summary (Gemini, or a template fallback).
 *
 * A scheduled job then escalates overdue tasks and finalises the recall
 * automatically once every holder has completed their task.
 */
@Injectable()
export class RecallAgentService {
  private readonly logger = new Logger(RecallAgentService.name);
  private readonly graph;

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private revocation: RevocationService,
    private audit: AuditService,
    private violations: ViolationsService,
    private gemini: GeminiService,
  ) {
    this.graph = new StateGraph(RecallState)
      .addNode('recallAgent', (s: State) => this.recallAgent(s))
      .addNode('inventoryAgent', (s: State) => this.inventoryAgent(s))
      .addNode('complianceAgent', (s: State) => this.complianceAgent(s))
      .addNode('notificationAgent', (s: State) => this.notificationAgent(s))
      .addNode('summaryAgent', (s: State) => this.summaryAgent(s))
      .addEdge(START, 'recallAgent')
      .addConditionalEdges('recallAgent', (s: State) => (s.recall ? 'inventoryAgent' : END))
      .addEdge('inventoryAgent', 'complianceAgent')
      .addEdge('complianceAgent', 'notificationAgent')
      .addEdge('notificationAgent', 'summaryAgent')
      .addEdge('summaryAgent', END)
      .compile();
  }

  /** Runs the full agent workflow for a recall. Safe to run again (idempotent). */
  async run(recallId: string) {
    const result = (await this.graph.invoke({ recallId })) as State;

    if (!result.recall) {
      return { recallId, status: 'SKIPPED', steps: result.steps };
    }

    await this.audit.log({
      action: 'AI_RECALL_AGENT_RUN',
      entity: 'RECALL',
      entityId: recallId,
      description: `AI recall agents processed ${result.recall.recallNumber}: ${result.holders.length} holders, ${result.tasksCreated} new tasks.`,
      metadata: { steps: result.steps, usedLlm: result.usedLlm },
    });

    return {
      recallId,
      recallNumber: result.recall.recallNumber,
      affectedOrganizations: result.holders.length,
      affectedUnits: result.affectedUnits,
      tasksCreated: result.tasksCreated,
      notified: result.notified,
      dueDate: result.dueDate,
      summary: result.summary,
      usedLlm: result.usedLlm,
      steps: result.steps,
    };
  }

  /** Fire-and-forget variant used right after a recall is created. */
  runInBackground(recallId: string) {
    setImmediate(() => {
      this.run(recallId).catch((err) => this.logger.error(`Recall agent failed for ${recallId}: ${err.message}`));
    });
  }

  // ---------------------------------------------------------------- agents

  private async recallAgent(state: State): Promise<Partial<State>> {
    const recall = await this.prisma.recall.findUnique({
      where: { id: state.recallId },
      include: { batch: { include: { manufacturer: true } } },
    });
    if (!recall) return { recall: null, steps: ['Recall Agent: recall not found'] };
    if (recall.status !== 'ACTIVE') return { recall: null, steps: ['Recall Agent: recall already completed'] };
    return {
      recall,
      steps: [`Recall Agent: ${recall.severity} recall ${recall.recallNumber} for batch ${recall.batch.batchNumber}`],
    };
  }

  private async inventoryAgent(state: State): Promise<Partial<State>> {
    const holdings = await this.prisma.inventory.findMany({
      where: { batchId: state.recall.batchId, quantity: { gt: 0 } },
    });
    const users = await this.prisma.user.findMany({
      where: { id: { in: holdings.map((h) => h.ownerUserId) } },
      select: { id: true, fullName: true, organizationName: true, role: true, city: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));
    const holders: Holder[] = holdings.map((h) => {
      const u = byId.get(h.ownerUserId);
      return {
        userId: h.ownerUserId,
        quantity: h.quantity,
        fullName: u?.fullName ?? 'Unknown',
        organizationName: u?.organizationName ?? null,
        role: u?.role ?? 'UNKNOWN',
        city: u?.city ?? null,
      };
    });
    const affectedUnits = holders.reduce((n, h) => n + h.quantity, 0);
    return {
      holders,
      affectedUnits,
      steps: [`Inventory Agent: located ${affectedUnits} units across ${holders.length} organisations`],
    };
  }

  private async complianceAgent(state: State): Promise<Partial<State>> {
    const hours = RECALL_DEADLINE_HOURS[state.recall.severity as RecallSeverity] ?? 72;
    const dueDate = state.recall.dueDate ?? new Date(new Date(state.recall.createdAt).getTime() + hours * 3600_000);

    let tasksCreated = 0;
    for (const h of state.holders) {
      const existing = await this.prisma.recallTask.findFirst({
        where: { recallId: state.recallId, userId: h.userId },
      });
      if (existing) continue;
      await this.prisma.recallTask.create({
        data: { recallId: state.recallId, userId: h.userId, status: 'PENDING', dueDate },
      });
      tasksCreated++;
    }

    if (!state.recall.dueDate) {
      await this.prisma.recall.update({ where: { id: state.recallId }, data: { dueDate } });
    }

    return {
      dueDate,
      tasksCreated,
      steps: [`Compliance Agent: ${tasksCreated} recall tasks created, deadline ${dueDate.toISOString()} (${hours}h)`],
    };
  }

  private async notificationAgent(state: State): Promise<Partial<State>> {
    let notified = 0;
    const due = state.dueDate ? state.dueDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'as soon as possible';
    for (const h of state.holders) {
      const already = await this.prisma.notification.findFirst({
        where: { userId: h.userId, title: 'Recall Action Required', metadata: { path: ['recallId'], equals: state.recallId } },
      });
      if (already) continue;
      await this.notifications.createNotification({
        userId: h.userId,
        title: 'Recall Action Required',
        message: `Quarantine ${h.quantity} units of ${state.recall.batch.drugName} (${state.recall.batch.batchNumber}) and complete your recall task by ${due}.`,
        type: 'RECALL',
        priority: state.recall.severity === 'CRITICAL' || state.recall.severity === 'HIGH' ? 'CRITICAL' : 'HIGH',
        actionUrl: '/recalls',
        metadata: { recallId: state.recallId, batchId: state.recall.batchId },
      });
      notified++;
    }
    return { notified, steps: [`Notification Agent: alerted ${notified} organisations`] };
  }

  private async summaryAgent(state: State): Promise<Partial<State>> {
    const r = state.recall;
    const fallback =
      `${r.severity} recall ${r.recallNumber}: ${r.batch.drugName} batch ${r.batch.batchNumber} ` +
      `(manufacturer ${r.batch.manufacturer?.name ?? 'unknown'}) is being recalled because "${r.reason}". ` +
      `${state.affectedUnits} units are held by ${state.holders.length} organisation(s). ` +
      `All holders must quarantine the stock and complete their recall task by ` +
      `${state.dueDate ? state.dueDate.toDateString() : 'the deadline'}; overdue tasks are escalated to regulators automatically.`;

    const llm = await this.gemini.generate(
      `Write a concise executive summary (max 90 words) of this pharmaceutical recall for regulators.
Include the risk to patients, the scope, and the next actions. Plain text, no markdown.

Recall: ${r.recallNumber}
Severity: ${r.severity}
Reason: ${r.reason}
Drug: ${r.batch.drugName}, batch ${r.batch.batchNumber}, expiry ${new Date(r.batch.expiryDate).toDateString()}
Manufacturer: ${r.batch.manufacturer?.name ?? 'unknown'}
Affected organisations: ${state.holders.map((h) => `${h.organizationName ?? h.fullName} (${h.role}, ${h.quantity} units)`).join('; ') || 'none'}
Deadline: ${state.dueDate?.toISOString() ?? 'n/a'}`,
      { system: 'You are a pharmaceutical drug-safety analyst. Be factual and brief.' },
    );

    const summary = llm ?? fallback;
    await this.prisma.recall.update({ where: { id: state.recallId }, data: { aiSummary: summary } });
    return { summary, usedLlm: !!llm, steps: [`Summary Agent: summary written (${llm ? 'Gemini' : 'template'})`] };
  }

  // ------------------------------------------------- escalation & finalising

  /** Every 30 minutes: escalate overdue tasks and finalise fully completed recalls. */
  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'recall-escalation' })
  async monitor() {
    const escalated = await this.escalateOverdue();
    const finalized = await this.finalizeCompleted();
    if (escalated || finalized) {
      this.logger.log(`Recall monitor: ${escalated} escalated, ${finalized} finalised`);
    }
    return { escalated, finalized };
  }

  async escalateOverdue() {
    const overdue = await this.prisma.recallTask.findMany({
      where: { status: 'PENDING', dueDate: { lt: new Date() }, escalatedAt: null },
      include: { recall: { include: { batch: true } }, user: { select: { id: true, fullName: true, organizationName: true } } },
    });
    if (!overdue.length) return 0;

    const oversight = await this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'REGULATOR'] }, status: 'ACTIVE' },
      select: { id: true },
    });

    for (const task of overdue) {
      await this.prisma.recallTask.update({
        where: { id: task.id },
        data: { status: 'OVERDUE', escalatedAt: new Date() },
      });
      const org = task.user.organizationName ?? task.user.fullName;
      await this.violations.record({
        type: 'RECALL_OVERDUE',
        severity: 'CRITICAL',
        description: `${org} missed the deadline for recall ${task.recall.recallNumber} (${task.recall.batch.batchNumber}).`,
        batchId: task.recall.batchId,
        userId: task.userId,
        metadata: { recallId: task.recallId, taskId: task.id },
      });
      await this.notifications.createNotification({
        userId: task.userId,
        title: 'Recall Task Overdue',
        message: `Your recall task for ${task.recall.batch.batchNumber} is overdue and has been escalated to the regulator.`,
        type: 'RECALL',
        priority: 'CRITICAL',
        actionUrl: '/recalls',
        metadata: { recallId: task.recallId, taskId: task.id },
      });
      for (const u of oversight) {
        await this.notifications.createNotification({
          userId: u.id,
          title: 'Recall Escalation',
          message: `${org} has not completed recall ${task.recall.recallNumber} for ${task.recall.batch.batchNumber}.`,
          type: 'COMPLIANCE',
          priority: 'CRITICAL',
          actionUrl: '/recalls',
          metadata: { recallId: task.recallId, taskId: task.id },
        });
      }
    }
    return overdue.length;
  }

  async finalizeCompleted() {
    const active = await this.prisma.recall.findMany({
      where: { status: 'ACTIVE' },
      include: { tasks: true },
    });
    let finalized = 0;
    for (const recall of active) {
      if (!recall.tasks.length) continue;
      if (recall.tasks.every((t) => t.status === 'COMPLETED')) {
        await this.finalize(recall.id);
        finalized++;
      }
    }
    return finalized;
  }

  async finalize(recallId: string) {
    const recall = await this.prisma.recall.update({
      where: { id: recallId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    await this.revocation.revokeBatch(recall.batchId, 'RECALL_COMPLETED');
    await this.audit.log({
      action: 'RECALL_COMPLETED',
      entity: 'RECALL',
      entityId: recallId,
      description: `Recall ${recall.recallNumber} completed; batch revoked.`,
    });
    return recall;
  }
}
