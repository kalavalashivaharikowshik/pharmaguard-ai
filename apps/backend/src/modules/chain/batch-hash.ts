import { ethers } from 'ethers';

/**
 * Fingerprint of a batch's critical data. Stored on-chain at creation and
 * recomputed during verification: any change to these fields is tampering.
 */
export function computeBatchHash(batch: {
  batchNumber: string;
  drugName: string;
  manufactureDate: Date | string;
  expiryDate: Date | string;
  quantity: number;
}): string {
  const payload = JSON.stringify({
    batchNumber: batch.batchNumber,
    drugName: batch.drugName,
    manufactureDate: batch.manufactureDate,
    expiryDate: batch.expiryDate,
    quantity: batch.quantity,
  });
  return ethers.utils.id(payload);
}
