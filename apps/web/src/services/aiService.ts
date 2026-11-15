import { api } from './api';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BatchRisk {
  batchId: string;
  batchNumber: string;
  drugName: string;
  status: string;
  expiryDate: string;
  daysToExpiry: number;
  unitsInStock: number;
  dailyMovement: number;
  projectedUnsoldAtExpiry: number;
  expiryRisk: number;
  expiryRiskLevel: RiskLevel;
  recallRisk: number;
  recallRiskLevel: RiskLevel;
  reasons: string[];
}

export interface Recommendation {
  type: string;
  priority: RiskLevel;
  title: string;
  detail: string;
  batchNumber?: string;
}

export interface Insights {
  generatedAt: string;
  aiProvider: string;
  counts: { batchesAnalysed: number; highExpiryRisk: number; highRecallRisk: number; lowStock: number; unitsAtRisk: number };
  narrative: string;
  recommendations: Recommendation[];
  risks: BatchRisk[];
  forecast: {
    history: { month: string; units: number }[];
    forecast: { month: string; units: number }[];
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    method: string;
  };
  stock: { batchNumber: string; drugName: string; unitsInStock: number; dailyMovement: number; daysOfStock: number; stockoutDate: string; lowStock: boolean }[];
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface RecallTask {
  id: string;
  recallId: string;
  userId: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
  notes?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  recall?: { id: string; recallNumber: string; severity: string; status: string; reason: string; batch: { id: string; batchNumber: string; drugName: string } };
  user?: { id: string; fullName: string; organizationName?: string | null; role: string; city?: string | null };
}

export const aiService = {
  async status() {
    return (await api.get('/ai/status')).data as { provider: string; enabled: boolean; model: string; agents: string[] };
  },
  async insights() {
    return (await api.get('/ai/insights')).data as Insights;
  },
  async chat(message: string, history: ChatTurn[]) {
    return (await api.post('/ai/chat', { message, history })).data as { answer: string; source: 'gemini' | 'rules' };
  },
  async myTasks() {
    return (await api.get('/ai/my-tasks')).data as RecallTask[];
  },
  async recallTasks(recallId: string) {
    return (await api.get(`/ai/recall/${recallId}/tasks`)).data as RecallTask[];
  },
  async completeTask(taskId: string, notes?: string) {
    return (await api.patch(`/ai/tasks/${taskId}/complete`, { notes })).data as RecallTask & { recallCompleted: boolean };
  },
  async impact(recallId: string) {
    return (await api.get(`/ai/recall/${recallId}/impact`)).data;
  },
  async summary(recallId: string) {
    return (await api.get(`/ai/recall/${recallId}/summary`)).data as { summary: string };
  },
  async runAgent(recallId: string) {
    return (await api.post(`/ai/recall/${recallId}/run-agent`)).data;
  },
  async finalize(recallId: string) {
    return (await api.post(`/ai/recall/${recallId}/finalize`)).data as { message: string };
  },
};
