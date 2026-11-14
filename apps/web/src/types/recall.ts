export interface Recall {
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