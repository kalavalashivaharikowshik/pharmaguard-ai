-- AlterEnum
ALTER TYPE "BatchStatus" ADD VALUE 'DESTROYED';

-- CreateEnum
CREATE TYPE "DisposalStatus" AS ENUM ('NOTICE_ISSUED', 'RETURNED', 'DESTROYED');

-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('EXPIRED_SALE_ATTEMPT', 'RECALLED_SALE_ATTEMPT', 'REVOKED_SALE_ATTEMPT', 'TAMPER_DETECTED', 'UNAUTHORIZED_TRANSFER', 'RECALL_OVERDUE', 'UNKNOWN_PRODUCT_SCAN');

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN "revocationTxHash" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "storageConditions" TEXT;

-- AlterTable
ALTER TABLE "Recall" ADD COLUMN "dueDate" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "aiSummary" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RecallTask" ADD COLUMN "dueDate" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "escalatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "preferences" JSONB;

-- CreateTable
CREATE TABLE "DisposalRecord" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisposalStatus" NOT NULL DEFAULT 'NOTICE_ISSUED',
    "notes" TEXT,
    "evidence" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisposalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL,
    "type" "ViolationType" NOT NULL,
    "severity" "NotificationPriority" NOT NULL DEFAULT 'HIGH',
    "description" TEXT NOT NULL,
    "batchId" TEXT,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DisposalRecord_batchId_userId_key" ON "DisposalRecord"("batchId", "userId");

-- CreateIndex
CREATE INDEX "Violation_createdAt_idx" ON "Violation"("createdAt");

-- AddForeignKey
ALTER TABLE "DisposalRecord" ADD CONSTRAINT "DisposalRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisposalRecord" ADD CONSTRAINT "DisposalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
