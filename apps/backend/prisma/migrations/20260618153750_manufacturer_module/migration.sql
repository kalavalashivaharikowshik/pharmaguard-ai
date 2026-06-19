-- AlterTable
ALTER TABLE "User" ADD COLUMN     "manufacturerId" TEXT;

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_licenseNumber_key" ON "Manufacturer"("licenseNumber");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
