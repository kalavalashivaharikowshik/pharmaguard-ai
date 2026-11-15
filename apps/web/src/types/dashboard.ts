export interface DashboardSummary {
  scope?: 'NETWORK' | 'ORGANISATION';
  totalBatches: number;
  activeBatches: number;
  revokedBatches: number;
  activeRecalls: number;
  inventoryUnits: number;
  notifications: number;
  expiringSoon?: number;
  pendingRecallTasks?: number;
  pendingDisposals?: number;
  recentTransfers?: {
    id: string;
    quantity: number;
    status: string;
    createdAt: string;
    batch: { batchNumber: string; drugName: string };
    fromUser: { fullName: string; organizationName?: string | null };
    toUser: { fullName: string; organizationName?: string | null };
  }[];
  recentRecalls?: {
    id: string;
    recallNumber: string;
    severity: string;
    status: string;
    createdAt: string;
    batch: { batchNumber: string; drugName: string };
  }[];
}
