import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { DisposalService } from './disposal.service';

function setup(record: any, remainingNotDestroyed = 0) {
  const prisma = {
    disposalRecord: {
      findUnique: jest.fn().mockResolvedValue(record),
      update: jest.fn().mockImplementation(({ data }) => ({ ...record, ...data })),
      count: jest.fn().mockResolvedValue(remainingNotDestroyed),
    },
    inventory: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    batch: { update: jest.fn().mockResolvedValue({}) },
    user: { findMany: jest.fn().mockResolvedValue([{ id: 'reg' }]) },
  };
  const notifications = { createNotification: jest.fn() };
  const audit = { log: jest.fn() };
  return { service: new DisposalService(prisma as any, notifications as any, audit as any), prisma };
}

const record = { id: 'd1', batchId: 'b1', userId: 'pharmacy', quantity: 100, status: 'NOTICE_ISSUED', batch: { batchNumber: 'AMX-1' } };

describe('DisposalService.update', () => {
  it('lets the holder destroy stock, empties their inventory and marks the batch destroyed', async () => {
    const { service, prisma } = setup(record, 0);
    const res = await service.update('d1', { status: 'DESTROYED' as any, evidence: 'CERT-1' }, 'pharmacy', 'PHARMACY');
    expect(res.status).toBe('DESTROYED');
    expect(prisma.inventory.updateMany).toHaveBeenCalledWith({ where: { batchId: 'b1', ownerUserId: 'pharmacy' }, data: { quantity: 0 } });
    expect(prisma.batch.update).toHaveBeenCalledWith({ where: { id: 'b1' }, data: { status: 'DESTROYED' } });
  });

  it('does not mark the batch destroyed while other holders still have it', async () => {
    const { service, prisma } = setup(record, 2);
    await service.update('d1', { status: 'DESTROYED' as any }, 'pharmacy', 'PHARMACY');
    expect(prisma.batch.update).not.toHaveBeenCalled();
  });

  it("forbids updating another organisation's record", async () => {
    const { service } = setup(record);
    await expect(service.update('d1', { status: 'DESTROYED' as any }, 'someone-else', 'DISTRIBUTOR')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects changes after destruction', async () => {
    const { service } = setup({ ...record, status: 'DESTROYED' });
    await expect(service.update('d1', { status: 'RETURNED' as any }, 'pharmacy', 'PHARMACY')).rejects.toBeInstanceOf(BadRequestException);
  });
});
