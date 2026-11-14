export type RecallSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type RecallStatus =
  | 'ACTIVE'
  | 'COMPLETED';

export interface Recall {
  id: string;

  recallNumber: string;

  reason: string;

  severity: RecallSeverity;

  status: RecallStatus;

  summary?: string;

  createdAt: string;

  batch: {
    id: string;
    drugName: string;
    batchNumber: string;
    expiryDate: string;
    status: string;

    manufacturer?: {
      id: string;
      name: string;
    };
  };
}