-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "revocationReason" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3);
