export interface ComplianceSummary {
  totalBatches: number;
  activeBatches: number;
  recalledBatches: number;
  totalTransfers: number;
  totalRecalls: number;
}

export interface ComplianceRecall {
  id: string;

  recallNumber: string;

  reason: string;

  severity: string;

  status: string;

  createdAt: string;

  batch: {
    drugName: string;
    batchNumber: string;
  };
}

export interface ComplianceTransfer {
  id: string;

  quantity: number;

  status: string;

  createdAt: string;

  batch: {
    drugName: string;
    batchNumber: string;
  };
}

export interface ComplianceExpiry {
  id: string;

  drugName: string;

  batchNumber: string;

  expiryDate: string;

  quantity: number;

  status: string;

  revokedAt: string | null;

  revocationReason: string | null;
}