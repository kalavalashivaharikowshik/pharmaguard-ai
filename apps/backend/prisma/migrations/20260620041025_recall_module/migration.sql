-- CreateEnum
CREATE TYPE "RecallSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RecallStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "Recall" (
    "id" TEXT NOT NULL,
    "recallNumber" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "severity" "RecallSeverity" NOT NULL,
    "status" "RecallStatus" NOT NULL DEFAULT 'ACTIVE',
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recall_recallNumber_key" ON "Recall"("recallNumber");

-- AddForeignKey
ALTER TABLE "Recall" ADD CONSTRAINT "Recall_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
