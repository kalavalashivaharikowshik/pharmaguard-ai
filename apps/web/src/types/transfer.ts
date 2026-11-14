export interface Transfer {
  id: string;

  quantity: number;

  status: string;

  createdAt: string;

  batch: {
    drugName: string;
    batchNumber: string;
  };

  fromUser: {
    fullName: string;
    role: string;
  };

  toUser: {
    fullName: string;
    role: string;
  };
}