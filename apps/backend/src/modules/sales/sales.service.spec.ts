import { NotFoundException } from '@nestjs/common';

import { SalesService } from './sales.service';

const future = new Date(Date.now() + 90 * 86_400_000);
const past = new Date(Date.now() - 86_400_000);

function setup(batch: any, opts: { verified?: boolean; revokedOnChain?: boolean; stock?: number } = {}) {
  const prisma = {
    batch: { findFirst: jest.fn().mockResolvedValue(batch) },
    inventory: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: opts.stock ?? 50 } }) },
  };
  const blockchain = {
    verifyBatch: jest.fn().mockResolvedValue({ verified: opts.verified ?? true, revokedOnChain: opts.revokedOnChain ?? false }),
  };
  const scanHistory = { create: jest.fn().mockResolvedValue({}) };
  const violations = { record: jest.fn().mockResolvedValue({}) };
  const service = new SalesService(prisma as any, blockchain as any, scanHistory as any, violations as any);
  return { service, violations, scanHistory };
}

const base = { id: 'b1', batchNumber: 'AMX-1', status: 'ACTIVE', expiryDate: future };

describe('SalesService.validateSale (smart-contract sale blocking)', () => {
  it('approves a safe, in-stock, verified batch', async () => {
    const { service, violations } = setup(base);
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res.approved).toBe(true);
    expect(violations.record).not.toHaveBeenCalled();
  });

  it('blocks a revoked batch and logs a violation', async () => {
    const { service, violations } = setup({ ...base, status: 'REVOKED' });
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res).toEqual({ approved: false, reason: 'REVOKED' });
    expect(violations.record).toHaveBeenCalledWith(expect.objectContaining({ type: 'REVOKED_SALE_ATTEMPT' }));
  });

  it('blocks a recalled batch', async () => {
    const { service, violations } = setup({ ...base, status: 'RECALLED' });
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res.reason).toBe('RECALLED');
    expect(violations.record).toHaveBeenCalledWith(expect.objectContaining({ type: 'RECALLED_SALE_ATTEMPT' }));
  });

  it('blocks an expired batch', async () => {
    const { service } = setup({ ...base, expiryDate: past });
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res.reason).toBe('EXPIRED');
  });

  it('blocks when blockchain verification fails (tampering)', async () => {
    const { service } = setup(base, { verified: false });
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res.reason).toBe('BLOCKCHAIN_VERIFICATION_FAILED');
  });

  it('blocks when the batch is revoked on-chain', async () => {
    const { service } = setup(base, { revokedOnChain: true });
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res.approved).toBe(false);
  });

  it('blocks when out of stock', async () => {
    const { service } = setup(base, { stock: 0 });
    const res = await service.validateSale({ qrCode: 'PG-AMX-1' }, 'u1');
    expect(res.reason).toBe('OUT_OF_STOCK');
  });

  it('rejects unknown QR codes as possible counterfeits', async () => {
    const { service, violations } = setup(null);
    await expect(service.validateSale({ qrCode: 'FAKE' }, 'u1')).rejects.toBeInstanceOf(NotFoundException);
    expect(violations.record).toHaveBeenCalledWith(expect.objectContaining({ type: 'UNKNOWN_PRODUCT_SCAN' }));
  });
});
