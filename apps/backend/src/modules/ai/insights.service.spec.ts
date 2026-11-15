import { InsightsService, type BatchRisk } from './insights.service';

const service = new InsightsService({} as any, { enabled: false } as any, {} as any);

function risk(over: Partial<BatchRisk>): BatchRisk {
  return {
    batchId: 'b',
    batchNumber: 'B-1',
    drugName: 'Drug',
    status: 'ACTIVE',
    expiryDate: new Date(),
    daysToExpiry: 200,
    unitsInStock: 100,
    dailyMovement: 1,
    projectedUnsoldAtExpiry: 0,
    expiryRisk: 10,
    expiryRiskLevel: 'LOW',
    recallRisk: 5,
    recallRiskLevel: 'LOW',
    reasons: [],
    ...over,
  };
}

describe('InsightsService.recommendations', () => {
  it('says "no urgent actions" when everything is safe', () => {
    const recs = service.recommendations([risk({})], [], 'PHARMACY');
    expect(recs).toHaveLength(1);
    expect(recs[0].title).toMatch(/No urgent actions/);
  });

  it('recommends FEFO dispensing for pharmacies with high expiry risk', () => {
    const recs = service.recommendations(
      [risk({ expiryRisk: 70, expiryRiskLevel: 'HIGH', daysToExpiry: 20, projectedUnsoldAtExpiry: 60 })],
      [],
      'PHARMACY',
    );
    expect(recs[0].type).toBe('EXPIRY');
    expect(recs[0].detail).toMatch(/FEFO/);
  });

  it('flags expired stock as critical and sorts it first', () => {
    const recs = service.recommendations(
      [
        risk({ batchNumber: 'OK', expiryRisk: 60, expiryRiskLevel: 'HIGH', daysToExpiry: 40 }),
        risk({ batchNumber: 'EXP', daysToExpiry: -2, expiryRisk: 100, expiryRiskLevel: 'CRITICAL' }),
      ],
      [],
      'DISTRIBUTOR',
    );
    expect(recs[0].priority).toBe('CRITICAL');
    expect(recs[0].batchNumber).toBe('EXP');
  });

  it('warns about low stock', () => {
    const recs = service.recommendations(
      [],
      [{ batchNumber: 'B-9', drugName: 'Insulin', unitsInStock: 10, dailyMovement: 2, daysOfStock: 5, stockoutDate: new Date(), lowStock: true }],
      'HOSPITAL',
    );
    expect(recs[0].type).toBe('STOCK');
    expect(recs[0].priority).toBe('HIGH');
  });
});
