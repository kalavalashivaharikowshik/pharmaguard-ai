export interface BlockchainVerification {

  batchNumber: string;

  verified: boolean;

  currentHash: string;

  blockchainHash: string;

  action?: string;
}