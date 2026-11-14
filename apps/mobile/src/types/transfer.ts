export interface Transfer {

  id: string;

  quantity: number;

  status: string;

  createdAt: string;

  batch: {

    id: string;

    drugName: string;

    batchNumber: string;

    status: TransferStatus;

  };

  fromUser?: {

    id: string;

    fullName: string;

    role: string;

  };

  toUser?: {

    id: string;

    fullName: string;

    role: string;

  };

}

export type TransferStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'REJECTED';