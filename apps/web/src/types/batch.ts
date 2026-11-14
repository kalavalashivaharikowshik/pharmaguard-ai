export interface Batch {
  id: string;

  drugName: string;

  batchNumber: string;

  quantity: number;

  qrCode: string | null;

  blockchainHash: string | null;

  transactionHash: string | null;

  status: string;

  manufactureDate: string;

  expiryDate: string;

  createdAt: string;

  manufacturer: {
    name: string;
  };
}