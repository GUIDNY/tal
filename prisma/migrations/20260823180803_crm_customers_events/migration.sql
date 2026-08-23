/*
  Warnings:

  - You are about to drop the `AvailabilityDate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BookingRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('lead', 'tentative', 'confirmed', 'completed', 'cancelled');

-- DropTable
DROP TABLE "AvailabilityDate";

-- DropTable
DROP TABLE "BookingRequest";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "DateStatus";

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT,
    "title" TEXT,
    "eventType" TEXT,
    "eventDate" DATE,
    "venue" TEXT,
    "city" TEXT,
    "guestCount" TEXT,
    "serviceType" TEXT,
    "message" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'lead',
    "source" TEXT NOT NULL DEFAULT 'website',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE INDEX "Event_customerId_idx" ON "Event"("customerId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
