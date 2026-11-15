import { api } from './api';

export interface DisposalRecord {
  id: string;
  quantity: number;
  reason: string;
  status: 'NOTICE_ISSUED' | 'RETURNED' | 'DESTROYED';
  evidence?: string | null;
  createdAt: string;
  completedAt?: string | null;
  userId: string;
  batch: { id: string; batchNumber: string; drugName: string; expiryDate: string; status: string };
  user: { fullName: string; organizationName?: string | null };
}

export const disposalService = {
  async list() {
    return (await api.get('/disposals')).data as DisposalRecord[];
  },
  async update(id: string, status: 'RETURNED' | 'DESTROYED', evidence?: string) {
    return (await api.patch(`/disposals/${id}`, { status, evidence: evidence || undefined })).data;
  },
};
