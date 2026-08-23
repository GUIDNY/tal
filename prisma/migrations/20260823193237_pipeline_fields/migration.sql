-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "price" INTEGER,
ADD COLUMN     "vatAmount" INTEGER,
ADD COLUMN     "commissionPercent" DOUBLE PRECISION,
ADD COLUMN     "closingProbability" INTEGER,
ADD COLUMN     "closedBy" TEXT,
ADD COLUMN     "nextFollowUpDate" DATE,
ADD COLUMN     "lastContactedAt" TIMESTAMP(3),
ADD COLUMN     "contactedBy" TEXT,
ADD COLUMN     "callNotes" TEXT;

-- CreateIndex
CREATE INDEX "Event_nextFollowUpDate_idx" ON "Event"("nextFollowUpDate");
