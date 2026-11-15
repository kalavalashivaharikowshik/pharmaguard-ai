import { api } from './api';

export type Verdict = 'SAFE' | 'WARNING' | 'BLOCKED' | 'COUNTERFEIT';

export interface ScanResult {
  verdict: Verdict;
  headline: string;
  reasons: string[];
  code: string;
  scannedAt: string;
  batch?: {
    id: string;
    drugName: string;
    batchNumber: string;
    manufacturer?: string;
    manufactureDate: string;
    expiryDate: string;
    daysToExpiry: number;
    status: string;
    category?: string | null;
    storageConditions?: string | null;
    unitsHeld: number;
  };
  blockchain?: {
    verified: boolean;
    enabled: boolean;
    network?: string;
    contractAddress?: string;
    transactionHash?: string | null;
    fingerprint?: string | null;
    revokedOnChain: boolean;
  };
  recall?: { recallNumber: string; severity: string; reason: string } | null;
}

export const scannerService = {
  /** Full safety verdict (blockchain, recall, expiry, revocation) and records the scan. */
  async scan(code: string): Promise<ScanResult> {
    const response = await api.post('/scan', { code });
    return response.data;
  },

  async verifyBatch(batchNumber: string) {
    const response = await api.get(`/blockchain/verify/${batchNumber}`);
    return response.data;
  },
};
