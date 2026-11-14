export interface ScanHistory {

  id: string;

  batchId?: string;

  batchNumber: string;

  qrCode: string;

  verified: boolean;

  result: string;

  scannedAt: string;

  batch?: {

    id: string;

    drugName: string;

    batchNumber: string;

    expiryDate: string;

    manufacturer: {

      id: string;

      name: string;

    };

  };

}