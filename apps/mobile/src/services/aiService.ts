import { api } from './api';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export const aiService = {
  async chat(message: string, history: ChatTurn[]) {
    const res = await api.post('/ai/chat', { message, history });
    return res.data as { answer: string; source: 'gemini' | 'rules' };
  },
  async insights() {
    const res = await api.get('/ai/insights');
    return res.data as {
      aiProvider: string;
      narrative: string;
      counts: { batchesAnalysed: number; highExpiryRisk: number; highRecallRisk: number; lowStock: number; unitsAtRisk: number };
      recommendations: { title: string; detail: string; priority: string }[];
      risks: { batchId: string; batchNumber: string; drugName: string; daysToExpiry: number; unitsInStock: number; expiryRiskLevel: string; recallRiskLevel: string }[];
      forecast: { history: { month: string; units: number }[]; forecast: { month: string; units: number }[]; trend: string };
    };
  },
  async myTasks() {
    const res = await api.get('/ai/my-tasks');
    return res.data as {
      id: string;
      status: string;
      dueDate?: string | null;
      recallId: string;
      recall: { id: string; recallNumber: string; severity: string; reason: string; batch: { batchNumber: string; drugName: string } };
    }[];
  },
  async recallSummary(recallId: string) {
    const res = await api.get(`/ai/recall/${recallId}/summary`);
    return res.data as { summary: string };
  },
  async recallImpact(recallId: string) {
    const res = await api.get(`/ai/recall/${recallId}/impact`);
    return res.data as {
      affectedOrganizations: number;
      affectedUnits: number;
      progress: number;
      dueDate?: string | null;
      tasks: { total: number; completed: number; overdue: number };
      locations: { userId: string; organization?: string; role?: string; city?: string | null; quantity: number; taskStatus: string }[];
    };
  },
  async completeTask(taskId: string, notes?: string) {
    const res = await api.patch(`/ai/tasks/${taskId}/complete`, { notes });
    return res.data as { recallCompleted: boolean };
  },
};

export const preferencesService = {
  async get() {
    const res = await api.get('/users/me');
    return (res.data?.preferences ?? {}) as Record<string, unknown>;
  },
  async update(patch: Record<string, unknown>) {
    const res = await api.patch('/users/me/preferences', patch);
    return res.data as Record<string, unknown>;
  },
};
