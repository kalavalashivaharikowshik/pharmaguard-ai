import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../infra/cache.service';
import { GeminiService } from './gemini.service';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BatchRisk {
  batchId: string;
  batchNumber: string;
  drugName: string;
  status: string;
  expiryDate: Date;
  daysToExpiry: number;
  unitsInStock: number;
  dailyMovement: number;
  projectedUnsoldAtExpiry: number;
  expiryRisk: number;
  expiryRiskLevel: RiskLevel;
  recallRisk: number;
  recallRiskLevel: RiskLevel;
  reasons: string[];
}

export interface Recommendation {
  type: 'EXPIRY' | 'STOCK' | 'RECALL' | 'COMPLIANCE' | 'TRANSFER';
  priority: RiskLevel;
  title: string;
  detail: string;
  batchNumber?: string;
}

const DAY = 86_400_000;

function level(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Pharmaceutical intelligence: expiry prediction, recall-risk scoring,
 * inventory demand forecasting, recommendations and a role-aware chat assistant.
 *
 * Scores are computed from real platform data with transparent rules, so every
 * number can be explained. Gemini (when configured) adds a natural-language
 * narrative and powers the chat assistant on top of those numbers.
 */
@Injectable()
export class InsightsService {
  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
    private cache: CacheService,
  ) {}

  // ------------------------------------------------------------------ scope

  /** Batches visible to a user: all for oversight roles, own/held for others. */
  private async scopedBatchIds(userId: string, role: string): Promise<string[] | null> {
    if (role === 'SUPER_ADMIN' || role === 'REGULATOR') return null;
    if (role === 'MANUFACTURER') {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { manufacturerId: true } });
      if (user?.manufacturerId) {
        const batches = await this.prisma.batch.findMany({ where: { manufacturerId: user.manufacturerId }, select: { id: true } });
        return batches.map((b) => b.id);
      }
    }
    const inv = await this.prisma.inventory.findMany({ where: { ownerUserId: userId }, select: { batchId: true } });
    return [...new Set(inv.map((i) => i.batchId))];
  }

  private ownsAllInventory(role: string) {
    return role === 'SUPER_ADMIN' || role === 'REGULATOR' || role === 'MANUFACTURER';
  }

  // ------------------------------------------------------------------- risk

  async batchRisks(userId: string, role: string): Promise<BatchRisk[]> {
    const ids = await this.scopedBatchIds(userId, role);
    const batches = await this.prisma.batch.findMany({
      where: { ...(ids ? { id: { in: ids } } : {}), status: { in: ['ACTIVE', 'RECALLED', 'TRANSFERRED'] } },
      include: { inventories: true, manufacturer: true },
    });
    if (!batches.length) return [];

    const since = new Date(Date.now() - 60 * DAY);
    const [transfers, recallsByMfr, violations, failedScans] = await Promise.all([
      this.prisma.batchTransfer.findMany({
        where: { batchId: { in: batches.map((b) => b.id) }, createdAt: { gte: since }, status: 'COMPLETED' },
        select: { batchId: true, quantity: true, fromUserId: true },
      }),
      this.prisma.recall.groupBy({ by: ['batchId'], _count: { _all: true } }),
      this.prisma.violation.groupBy({ by: ['batchId'], where: { batchId: { not: null } }, _count: { _all: true } }),
      this.prisma.scanHistory.groupBy({ by: ['batchId'], where: { verified: false, batchId: { not: null } }, _count: { _all: true } }),
    ]);

    // Manufacturer recall history: share of their batches that were ever recalled.
    const recallBatchIds = new Set(recallsByMfr.map((r) => r.batchId));
    const allMfrBatches = await this.prisma.batch.findMany({
      where: { manufacturerId: { in: [...new Set(batches.map((b) => b.manufacturerId))] } },
      select: { id: true, manufacturerId: true },
    });
    const mfrStats = new Map<string, { total: number; recalled: number }>();
    for (const b of allMfrBatches) {
      const s = mfrStats.get(b.manufacturerId) ?? { total: 0, recalled: 0 };
      s.total++;
      if (recallBatchIds.has(b.id)) s.recalled++;
      mfrStats.set(b.manufacturerId, s);
    }
    const vCount = new Map(violations.map((v) => [v.batchId, v._count._all]));
    const fCount = new Map(failedScans.map((f) => [f.batchId, f._count._all]));
    const scope = this.ownsAllInventory(role);

    return batches
      .map((b) => {
        const daysToExpiry = Math.ceil((b.expiryDate.getTime() - Date.now()) / DAY);
        const units = b.inventories
          .filter((i) => scope || i.ownerUserId === userId)
          .reduce((n, i) => n + i.quantity, 0);

        // Movement = units transferred out per day (proxy for demand).
        const moved = transfers
          .filter((t) => t.batchId === b.id && (scope || t.fromUserId === userId))
          .reduce((n, t) => n + t.quantity, 0);
        const dailyMovement = Math.round((moved / 60) * 10) / 10;
        const projectedSold = dailyMovement * Math.max(daysToExpiry, 0);
        const projectedUnsold = Math.max(0, Math.round(units - projectedSold));

        // ---- expiry risk
        const reasons: string[] = [];
        let expiryRisk = 0;
        if (daysToExpiry <= 0) {
          expiryRisk = 100;
          reasons.push('Already expired');
        } else {
          if (daysToExpiry <= 30) expiryRisk += 50;
          else if (daysToExpiry <= 90) expiryRisk += 30;
          else if (daysToExpiry <= 180) expiryRisk += 12;
          const unsoldShare = units > 0 ? projectedUnsold / units : 0;
          expiryRisk += Math.round(unsoldShare * 45);
          if (units > 0 && dailyMovement === 0 && daysToExpiry <= 180) {
            expiryRisk += 10;
            reasons.push('No stock movement in the last 60 days');
          }
          if (daysToExpiry <= 90) reasons.push(`Expires in ${daysToExpiry} days`);
          if (projectedUnsold > 0 && units > 0) reasons.push(`~${projectedUnsold} of ${units} units may expire unsold at current pace`);
        }
        expiryRisk = Math.min(100, expiryRisk);

        // ---- recall risk
        let recallRisk = 5;
        const mfr = mfrStats.get(b.manufacturerId);
        if (mfr && mfr.total > 1) {
          const rate = mfr.recalled / mfr.total;
          recallRisk += Math.round(rate * 40);
          if (rate > 0) reasons.push(`Manufacturer recall rate ${(rate * 100).toFixed(0)}%`);
        }
        const v = vCount.get(b.id) ?? 0;
        const f = fCount.get(b.id) ?? 0;
        if (v) {
          recallRisk += Math.min(30, v * 10);
          reasons.push(`${v} compliance violation(s) recorded`);
        }
        if (f) {
          recallRisk += Math.min(20, f * 5);
          reasons.push(`${f} failed verification scan(s)`);
        }
        if (!b.blockchainHash) {
          recallRisk += 15;
          reasons.push('Not registered on blockchain');
        }
        if (b.status === 'RECALLED') {
          recallRisk = 100;
          reasons.push('Under active recall');
        }
        recallRisk = Math.min(100, recallRisk);

        return {
          batchId: b.id,
          batchNumber: b.batchNumber,
          drugName: b.drugName,
          status: b.status,
          expiryDate: b.expiryDate,
          daysToExpiry,
          unitsInStock: units,
          dailyMovement,
          projectedUnsoldAtExpiry: projectedUnsold,
          expiryRisk,
          expiryRiskLevel: level(expiryRisk),
          recallRisk,
          recallRiskLevel: level(recallRisk),
          reasons,
        } as BatchRisk;
      })
      .sort((a, b) => Math.max(b.expiryRisk, b.recallRisk) - Math.max(a.expiryRisk, a.recallRisk));
  }

  async batchRisk(batchId: string, userId: string, role: string) {
    const all = await this.batchRisks(userId, role);
    const risk = all.find((r) => r.batchId === batchId);
    if (!risk) throw new NotFoundException('Batch not found in your scope');
    return risk;
  }

  // ------------------------------------------------------------ forecasting

  /** Monthly units moved for the last 6 months plus a 3-month forecast (linear trend). */
  async inventoryForecast(userId: string, role: string) {
    const scope = this.ownsAllInventory(role);
    const ids = await this.scopedBatchIds(userId, role);
    const start = new Date();
    start.setMonth(start.getMonth() - 5, 1);
    start.setHours(0, 0, 0, 0);

    const transfers = await this.prisma.batchTransfer.findMany({
      where: {
        createdAt: { gte: start },
        status: 'COMPLETED',
        ...(ids ? { batchId: { in: ids } } : {}),
        ...(scope ? {} : { OR: [{ fromUserId: userId }, { toUserId: userId }] }),
      },
      select: { quantity: true, createdAt: true },
    });

    const months: { month: string; units: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      months.push({ month: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }), units: 0 });
    }
    for (const t of transfers) {
      const idx = (t.createdAt.getFullYear() - start.getFullYear()) * 12 + t.createdAt.getMonth() - start.getMonth();
      if (idx >= 0 && idx < 6) months[idx].units += t.quantity;
    }

    // Least-squares linear regression over the 6 months.
    const n = months.length;
    const xs = months.map((_, i) => i);
    const ys = months.map((m) => m.units);
    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0);
    const den = xs.reduce((s, x) => s + (x - xMean) ** 2, 0) || 1;
    const slope = num / den;
    const intercept = yMean - slope * xMean;

    const forecast: { month: string; units: number }[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + 5 + i);
      forecast.push({
        month: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        units: Math.max(0, Math.round(intercept + slope * (n - 1 + i))),
      });
    }

    const trend = slope > yMean * 0.05 ? 'INCREASING' : slope < -yMean * 0.05 ? 'DECREASING' : 'STABLE';
    return { history: months, forecast, trend, method: 'Linear regression on 6 months of completed transfers' };
  }

  /** Low-stock / stock-out prediction per held batch. */
  async stockPredictions(userId: string, role: string) {
    const risks = await this.batchRisks(userId, role);
    return risks
      .filter((r) => r.status === 'ACTIVE' && r.unitsInStock > 0 && r.dailyMovement > 0)
      .map((r) => {
        const daysOfStock = Math.round(r.unitsInStock / r.dailyMovement);
        return {
          batchNumber: r.batchNumber,
          drugName: r.drugName,
          unitsInStock: r.unitsInStock,
          dailyMovement: r.dailyMovement,
          daysOfStock,
          stockoutDate: new Date(Date.now() + daysOfStock * DAY),
          lowStock: daysOfStock <= 14,
        };
      })
      .sort((a, b) => a.daysOfStock - b.daysOfStock);
  }

  // -------------------------------------------------------- recommendations

  recommendations(risks: BatchRisk[], stock: Awaited<ReturnType<InsightsService['stockPredictions']>>, role: string): Recommendation[] {
    const recs: Recommendation[] = [];

    for (const r of risks.filter((x) => x.expiryRisk >= 55 && x.daysToExpiry > 0).slice(0, 4)) {
      recs.push({
        type: 'EXPIRY',
        priority: r.expiryRiskLevel,
        batchNumber: r.batchNumber,
        title: `Move ${r.drugName} (${r.batchNumber}) before it expires`,
        detail:
          role === 'PHARMACY' || role === 'HOSPITAL'
            ? `Dispense this batch first (FEFO). ${r.projectedUnsoldAtExpiry} units may expire unsold in ${r.daysToExpiry} days.`
            : `Prioritise transferring this batch downstream. ${r.projectedUnsoldAtExpiry} units may expire unsold in ${r.daysToExpiry} days.`,
      });
    }
    for (const r of risks.filter((x) => x.daysToExpiry <= 0 && x.unitsInStock > 0).slice(0, 3)) {
      recs.push({
        type: 'COMPLIANCE',
        priority: 'CRITICAL',
        batchNumber: r.batchNumber,
        title: `Quarantine expired stock: ${r.batchNumber}`,
        detail: `${r.unitsInStock} units are past expiry. Stop sales and complete the disposal notice.`,
      });
    }
    for (const r of risks.filter((x) => x.recallRisk >= 55 && x.status !== 'RECALLED').slice(0, 3)) {
      recs.push({
        type: 'RECALL',
        priority: r.recallRiskLevel,
        batchNumber: r.batchNumber,
        title: `Review recall risk for ${r.batchNumber}`,
        detail: `Risk drivers: ${r.reasons.slice(0, 3).join('; ')}. Consider re-verifying on blockchain and inspecting stock.`,
      });
    }
    for (const s of stock.filter((x) => x.lowStock).slice(0, 3)) {
      recs.push({
        type: 'STOCK',
        priority: s.daysOfStock <= 7 ? 'HIGH' : 'MEDIUM',
        batchNumber: s.batchNumber,
        title: `Low stock: ${s.drugName}`,
        detail: `About ${s.daysOfStock} days of stock left at ${s.dailyMovement} units/day. Plan replenishment.`,
      });
    }
    if (!recs.length) {
      recs.push({
        type: 'COMPLIANCE',
        priority: 'LOW',
        title: 'No urgent actions',
        detail: 'All batches in your scope are within safe expiry and recall-risk limits.',
      });
    }
    const order: Record<RiskLevel, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return recs.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  /** Everything the AI Insights page needs, cached for 2 minutes per user. */
  async insights(userId: string, role: string) {
    return this.cache.wrap(`ai:insights:${userId}`, 120, async () => {
      const [risks, forecast, stock] = await Promise.all([
        this.batchRisks(userId, role),
        this.inventoryForecast(userId, role),
        this.stockPredictions(userId, role),
      ]);
      const recommendations = this.recommendations(risks, stock, role);

      const counts = {
        batchesAnalysed: risks.length,
        highExpiryRisk: risks.filter((r) => r.expiryRisk >= 55).length,
        highRecallRisk: risks.filter((r) => r.recallRisk >= 55).length,
        lowStock: stock.filter((s) => s.lowStock).length,
        unitsAtRisk: risks.filter((r) => r.expiryRisk >= 55).reduce((n, r) => n + r.projectedUnsoldAtExpiry, 0),
      };

      const narrative =
        (await this.gemini.generate(
          `You are advising a ${role.replace('_', ' ').toLowerCase()} in a pharmaceutical supply chain.
Write 3 short bullet points (max 25 words each) with the most important insights and actions. Plain text bullets starting with "- ".

Summary: ${JSON.stringify(counts)}
Forecast trend: ${forecast.trend}; next 3 months: ${forecast.forecast.map((f) => `${f.month} ${f.units}`).join(', ')}
Top risks: ${risks
            .slice(0, 5)
            .map((r) => `${r.batchNumber} ${r.drugName}: expiry ${r.expiryRiskLevel}, recall ${r.recallRiskLevel} (${r.reasons.slice(0, 2).join(', ')})`)
            .join(' | ')}`,
          { system: 'You are a concise pharmaceutical supply-chain analyst.', maxOutputTokens: 300 },
        )) ?? this.fallbackNarrative(counts, forecast.trend);

      return {
        generatedAt: new Date(),
        aiProvider: this.gemini.enabled ? `Google Gemini (${this.gemini.model})` : 'Rule-based engine',
        counts,
        narrative,
        recommendations,
        risks: risks.slice(0, 25),
        forecast,
        stock: stock.slice(0, 15),
      };
    });
  }

  private fallbackNarrative(counts: Record<string, number>, trend: string) {
    return [
      `- ${counts.highExpiryRisk} batch(es) are at high expiry risk, with about ${counts.unitsAtRisk} units that may expire unsold.`,
      `- ${counts.highRecallRisk} batch(es) show elevated recall risk; re-verify them on the blockchain.`,
      `- Stock movement trend is ${trend.toLowerCase()}; ${counts.lowStock} batch(es) may run low within two weeks.`,
    ].join('\n');
  }

  // ---------------------------------------------------------- chat assistant

  private async chatContext(userId: string, role: string) {
    const [user, risks, stock] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, organizationName: true, role: true } }),
      this.batchRisks(userId, role),
      this.stockPredictions(userId, role),
    ]);
    const oversight = role === 'SUPER_ADMIN' || role === 'REGULATOR';
    const [recalls, transfers, revoked, violations] = await Promise.all([
      this.prisma.recall.findMany({
        where: oversight ? {} : { batchId: { in: risks.map((r) => r.batchId) } },
        include: { batch: { select: { batchNumber: true, drugName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.batchTransfer.findMany({
        where: oversight ? {} : { OR: [{ fromUserId: userId }, { toUserId: userId }] },
        include: {
          batch: { select: { batchNumber: true, drugName: true } },
          fromUser: { select: { organizationName: true, fullName: true } },
          toUser: { select: { organizationName: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.batch.count({ where: { status: 'REVOKED' } }),
      oversight ? this.prisma.violation.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * DAY) } } }) : Promise.resolve(0),
    ]);
    return { user, role, risks, stock, recalls, transfers, revoked, violations, oversight };
  }

  async chat(userId: string, role: string, message: string, history: { role: 'user' | 'assistant'; content: string }[] = []) {
    const ctx = await this.chatContext(userId, role);

    const data = {
      you: ctx.user,
      inventory: ctx.risks.slice(0, 20).map((r) => ({
        batch: r.batchNumber,
        drug: r.drugName,
        status: r.status,
        units: r.unitsInStock,
        expiry: r.expiryDate.toISOString().slice(0, 10),
        daysToExpiry: r.daysToExpiry,
        expiryRisk: r.expiryRiskLevel,
        recallRisk: r.recallRiskLevel,
      })),
      lowStock: ctx.stock.filter((s) => s.lowStock).map((s) => ({ batch: s.batchNumber, daysOfStock: s.daysOfStock })),
      recentRecalls: ctx.recalls.map((r) => ({ number: r.recallNumber, batch: r.batch.batchNumber, drug: r.batch.drugName, severity: r.severity, status: r.status, reason: r.reason })),
      recentTransfers: ctx.transfers.map((t) => ({
        batch: t.batch.batchNumber,
        qty: t.quantity,
        from: t.fromUser.organizationName ?? t.fromUser.fullName,
        to: t.toUser.organizationName ?? t.toUser.fullName,
        date: t.createdAt.toISOString().slice(0, 10),
        status: t.status,
      })),
      ...(ctx.oversight ? { revokedBatchesTotal: ctx.revoked, violationsLast30Days: ctx.violations } : {}),
    };

    const convo = history
      .slice(-6)
      .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const answer = await this.gemini.generate(
      `${convo ? `Conversation so far:\n${convo}\n\n` : ''}User question: ${message}\n\nPlatform data visible to this user (JSON):\n${JSON.stringify(data)}`,
      {
        system:
          'You are PharmaGuard AI, an assistant inside a pharmaceutical supply-chain safety platform. ' +
          'Answer ONLY from the platform data provided; if the data does not contain the answer, say so. ' +
          'The data is already restricted to what this user is allowed to see, never speculate about other organisations. ' +
          'Be concise (under 120 words), use short bullet lists for multiple items, and recommend safe actions. ' +
          'Do not give medical dosing advice.',
        temperature: 0.2,
        maxOutputTokens: 500,
      },
    );

    if (answer) return { answer, source: 'gemini' as const };
    return { answer: this.fallbackAnswer(message, ctx, data), source: 'rules' as const };
  }

  /** Keyword-based answers used when Gemini is not configured or unavailable. */
  private fallbackAnswer(message: string, ctx: Awaited<ReturnType<InsightsService['chatContext']>>, data: any): string {
    const q = message.toLowerCase();
    const list = (rows: string[]) => (rows.length ? rows.map((r) => `- ${r}`).join('\n') : '- None found.');

    const batchMatch = ctx.risks.find((r) => q.includes(r.batchNumber.toLowerCase()));
    if (batchMatch) {
      return `${batchMatch.drugName} (${batchMatch.batchNumber}) is ${batchMatch.status}, ${batchMatch.unitsInStock} units in stock, expires ${batchMatch.expiryDate.toDateString()} (${batchMatch.daysToExpiry} days). Expiry risk ${batchMatch.expiryRiskLevel}, recall risk ${batchMatch.recallRiskLevel}.${batchMatch.reasons.length ? `\nReasons: ${batchMatch.reasons.join('; ')}.` : ''}`;
    }
    if (/expir/.test(q)) {
      const rows = ctx.risks.filter((r) => r.daysToExpiry <= 90).map((r) => `${r.batchNumber} ${r.drugName}: ${r.daysToExpiry <= 0 ? 'expired' : `${r.daysToExpiry} days left`}, ${r.unitsInStock} units`);
      return `Batches expiring within 90 days:\n${list(rows)}`;
    }
    if (/recall/.test(q)) {
      return `Recent recalls:\n${list(data.recentRecalls.map((r: any) => `${r.number} (${r.severity}, ${r.status}): ${r.drug} ${r.batch}, ${r.reason}`))}`;
    }
    if (/transfer|ship|sent|receiv/.test(q)) {
      return `Recent transfers:\n${list(data.recentTransfers.map((t: any) => `${t.date}: ${t.qty} × ${t.batch} from ${t.from} to ${t.to} (${t.status})`))}`;
    }
    if (/low stock|stock out|stockout|run out|reorder/.test(q)) {
      return `Batches likely to run low within 14 days:\n${list(data.lowStock.map((s: any) => `${s.batch}: about ${s.daysOfStock} days left`))}`;
    }
    if (/risk/.test(q)) {
      const rows = ctx.risks.slice(0, 5).map((r) => `${r.batchNumber} ${r.drugName}: expiry ${r.expiryRiskLevel}, recall ${r.recallRiskLevel}`);
      return `Highest-risk batches:\n${list(rows)}`;
    }
    if (/inventory|stock|how many|units/.test(q)) {
      const total = ctx.risks.reduce((n, r) => n + r.unitsInStock, 0);
      const rows = ctx.risks.slice(0, 8).map((r) => `${r.batchNumber} ${r.drugName}: ${r.unitsInStock} units (${r.status})`);
      return `You have ${total} units across ${ctx.risks.length} active batches:\n${list(rows)}`;
    }
    return (
      'I can answer questions about your inventory, expiring batches, recalls, transfers, low stock and risk. ' +
      'Try "Which batches expire soon?" or "Show recent recalls". (Connect a Gemini API key for free-form answers.)'
    );
  }
}
