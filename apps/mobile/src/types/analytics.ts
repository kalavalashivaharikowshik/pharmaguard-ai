export interface AnalyticsSummary {

  inventory: number;

  transfers: number;

  recalls: number;

  manufacturers: number;

  activeBatches: number;

  revokedBatches: number;

}

export interface MonthlyInventory {

  month: number;

  quantity: number;

}

export interface MonthlyTransfer {

  month: number;

  transfers: number;

}

export interface MonthlyRecall {

  month: number;

  recalls: number;

}

export interface ManufacturerStatistic {

  id: string;

  name: string;

  batches: number;

}

export interface RecallDistribution {

  LOW: number;

  MEDIUM: number;

  HIGH: number;

  CRITICAL: number;

}

export interface DashboardAnalytics {

  summary: AnalyticsSummary;

  inventoryTrend: MonthlyInventory[];

  transferTrend: MonthlyTransfer[];

  recallTrend: MonthlyRecall[];

  manufacturerStats: ManufacturerStatistic[];

  recallDistribution: RecallDistribution;

}