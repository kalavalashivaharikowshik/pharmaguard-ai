export interface Inventory {
  id: string;
  quantity: number;

  batch: {
    drugName: string;
    batchNumber: string;
    status: string;
  };
}