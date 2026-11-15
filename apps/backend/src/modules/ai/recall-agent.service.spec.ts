import { RECALL_DEADLINE_HOURS, RecallAgentService } from './recall-agent.service';

describe('RecallAgentService', () => {
  it('uses shorter deadlines for more severe recalls', () => {
    expect(RECALL_DEADLINE_HOURS.CRITICAL).toBeLessThan(RECALL_DEADLINE_HOURS.HIGH);
    expect(RECALL_DEADLINE_HOURS.HIGH).toBeLessThan(RECALL_DEADLINE_HOURS.MEDIUM);
    expect(RECALL_DEADLINE_HOURS.MEDIUM).toBeLessThan(RECALL_DEADLINE_HOURS.LOW);
  });

  it('runs the agent graph: locates stock, creates tasks with deadlines, notifies and summarises', async () => {
    const recall = {
      id: 'r1',
      recallNumber: 'RCL-1',
      status: 'ACTIVE',
      severity: 'CRITICAL',
      reason: 'Contamination',
      batchId: 'b1',
      dueDate: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      batch: { batchNumber: 'AMX-1', drugName: 'Amoxicillin', expiryDate: new Date(), manufacturer: { name: 'Sun Life' } },
    };
    const prisma = {
      recall: { findUnique: jest.fn().mockResolvedValue(recall), update: jest.fn().mockResolvedValue({}) },
      inventory: {
        findMany: jest.fn().mockResolvedValue([
          { ownerUserId: 'dist', quantity: 300 },
          { ownerUserId: 'pha', quantity: 100 },
        ]),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'dist', fullName: 'D', organizationName: 'MedLine', role: 'DISTRIBUTOR', city: 'Hyd' },
          { id: 'pha', fullName: 'P', organizationName: 'Apollo', role: 'PHARMACY', city: 'Hyd' },
        ]),
      },
      recallTask: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({}) },
      notification: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const notifications = { createNotification: jest.fn() };
    const audit = { log: jest.fn() };
    const gemini = { generate: jest.fn().mockResolvedValue(null) };
    const agent = new RecallAgentService(prisma as any, notifications as any, {} as any, audit as any, {} as any, gemini as any);

    const result = await agent.run('r1');

    expect(result.affectedOrganizations).toBe(2);
    expect(result.affectedUnits).toBe(400);
    expect(result.tasksCreated).toBe(2);
    expect(result.notified).toBe(2);
    expect(result.usedLlm).toBe(false);
    expect(result.summary).toMatch(/400 units/);
    // CRITICAL → 24h deadline from creation
    expect(new Date(result.dueDate as any).toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(prisma.recallTask.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ recallId: 'r1', userId: 'pha', status: 'PENDING' }),
    });
    expect(result.steps).toHaveLength(5);
  });

  it('skips completed recalls', async () => {
    const prisma = { recall: { findUnique: jest.fn().mockResolvedValue({ id: 'r', status: 'COMPLETED', batch: {} }) } };
    const agent = new RecallAgentService(prisma as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    const result = await agent.run('r');
    expect(result.status).toBe('SKIPPED');
  });
});
