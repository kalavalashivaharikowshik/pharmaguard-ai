-- CreateEnum
CREATE TYPE "RecallTaskStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- CreateTable
CREATE TABLE "RecallTask" (
    "id" TEXT NOT NULL,
    "recallId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RecallTaskStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecallTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecallTask" ADD CONSTRAINT "RecallTask_recallId_fkey" FOREIGN KEY ("recallId") REFERENCES "Recall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecallTask" ADD CONSTRAINT "RecallTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
