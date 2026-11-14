export interface VerificationResult {
  authentic: boolean;

  drugName?: string;

  batchNumber?: string;

  manufacturer?: string;

  status?: string;

  expiryDate?: string;

  message?: string;
}