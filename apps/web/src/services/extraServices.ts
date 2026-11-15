import { api } from './api';

export interface Manufacturer {
  id: string;
  name: string;
  licenseNumber: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  _count?: { batches: number; users: number };
}

export interface DisposalRecord {
  id: string;
  batchId: string;
  userId: string;
  quantity: number;
  reason: string;
  status: 'NOTICE_ISSUED' | 'RETURNED' | 'DESTROYED';
  notes?: string | null;
  evidence?: string | null;
  completedAt?: string | null;
  createdAt: string;
  batch: { id: string; batchNumber: string; drugName: string; expiryDate: string; status: string };
  user: { id: string; fullName: string; organizationName?: string | null; role: string };
}

export interface Violation {
  id: string;
  type: string;
  severity: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  batch?: { id: string; batchNumber: string; drugName: string } | null;
  user?: { id: string; fullName: string; organizationName?: string | null; role: string } | null;
}

export interface MapPoint {
  userId: string;
  organization: string;
  role: string;
  city?: string | null;
  latitude: number;
  longitude: number;
  totalUnits: number;
  atRiskUnits: number;
  batches: { batchNumber: string; drugName: string; status: string; quantity: number }[];
}

export const manufacturerService = {
  async list() {
    return (await api.get('/manufacturers')).data as Manufacturer[];
  },
  async get(id: string) {
    return (await api.get(`/manufacturers/${id}`)).data;
  },
  async create(data: Partial<Manufacturer>) {
    return (await api.post('/manufacturers', data)).data as Manufacturer;
  },
  async update(id: string, data: Partial<Manufacturer>) {
    return (await api.patch(`/manufacturers/${id}`, data)).data as Manufacturer;
  },
  async remove(id: string) {
    return (await api.delete(`/manufacturers/${id}`)).data;
  },
};

export const disposalService = {
  async list() {
    return (await api.get('/disposals')).data as DisposalRecord[];
  },
  async summary() {
    return (await api.get('/disposals/summary')).data as {
      total: number;
      pending: number;
      returned: number;
      destroyed: number;
      unitsPending: number;
      completionRate: number;
    };
  },
  async update(id: string, data: { status: 'RETURNED' | 'DESTROYED'; notes?: string; evidence?: string }) {
    return (await api.patch(`/disposals/${id}`, data)).data;
  },
};

export const violationService = {
  async list(type?: string) {
    return (await api.get('/compliance/violations', { params: type ? { type } : {} })).data as Violation[];
  },
};

export const analyticsService = {
  async dashboard(year?: number) {
    return (await api.get('/analytics/dashboard', { params: year ? { year } : {} })).data as {
      summary: { inventory: number; transfers: number; recalls: number; manufacturers: number; activeBatches: number; revokedBatches: number };
      inventoryTrend: { month: number; quantity: number }[];
      transferTrend: { month: number; transfers: number }[];
      recallTrend: { month: number; recalls: number }[];
      manufacturerStats: { id: string; name: string; batches: number }[];
      recallDistribution: Record<string, number>;
    };
  },
  async safety() {
    return (await api.get('/analytics/safety-metrics')).data;
  },
  async stockMap(recallId?: string) {
    return (await api.get('/analytics/stock-map', { params: recallId ? { recallId } : {} })).data as {
      points: MapPoint[];
      withoutLocation: number;
    };
  },
};

export const profileService = {
  async me() {
    return (await api.get('/users/me')).data;
  },
  async update(data: Record<string, unknown>) {
    return (await api.patch('/users/me', data)).data;
  },
  async preferences(data: Record<string, unknown>) {
    return (await api.patch('/users/me/preferences', data)).data;
  },
};

/** Pulls a readable message out of an Axios error. */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  return m || e?.message || fallback;
}
