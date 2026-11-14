export interface Revocation {
  id: string;

  drugName: string;

  batchNumber: string;

  revokedAt: string;

  revocationReason: string;

  manufacturerId: string;
}

export interface RevocationSummary {
  revokedBatches: number;
  expired: number;
  tampered: number;
  recalled: number;
}