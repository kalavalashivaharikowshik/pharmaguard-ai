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
}
