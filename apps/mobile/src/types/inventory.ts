export interface InventoryBatch {
  id: string;

  quantity: number;

  createdAt: string;

  updatedAt: string;

  // NEW
  ownerUserId: string;

  // NEW (optional)
  owner?: {
    fullName: string;
    role: string;
  };

  batch: {
    id: string;

    drugName: string;

    batchNumber: string;

    expiryDate: string;

    manufactureDate: string;

    qrCode?: string;

    blockchainHash?: string;

    transactionHash?: string;

    status: string;

    manufacturer: {
      id: string;

      name: string;
    };
  };
}

export interface BlockchainVerification {
  batchNumber: string;

  verified: boolean;

  currentHash: string;

  blockchainHash: string;

  action?: string;
}