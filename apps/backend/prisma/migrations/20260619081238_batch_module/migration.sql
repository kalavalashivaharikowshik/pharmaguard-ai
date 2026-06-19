-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('ACTIVE', 'RECALLED', 'EXPIRED', 'TRANSFERRED', 'REVOKED');

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufactureDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "qrCode" TEXT,
    "status" "BatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "manufacturerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchNumber_key" ON "Batch"("batchNumber");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
