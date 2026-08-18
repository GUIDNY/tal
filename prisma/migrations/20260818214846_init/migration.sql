-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('new', 'contacted', 'qualified', 'booked', 'lost');

-- CreateEnum
CREATE TYPE "DateStatus" AS ENUM ('available', 'hold', 'booked');

-- CreateTable
CREATE TABLE "BookingRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "eventType" TEXT NOT NULL,
    "eventDate" DATE,
    "venue" TEXT,
    "city" TEXT NOT NULL,
    "guestCount" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" "BookingStatus" NOT NULL DEFAULT 'new',

    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "DateStatus" NOT NULL,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest"("status");

-- CreateIndex
CREATE INDEX "BookingRequest_eventDate_idx" ON "BookingRequest"("eventDate");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityDate_date_key" ON "AvailabilityDate"("date");
