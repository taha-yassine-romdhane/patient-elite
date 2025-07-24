-- CreateEnum
CREATE TYPE "RENEWAL_TYPE" AS ENUM ('EXTENSION', 'MODIFICATION', 'EQUIPMENT_CHANGE', 'UPGRADE', 'DOWNGRADE');

-- CreateEnum
CREATE TYPE "MODIFICATION_TYPE" AS ENUM ('ADD_ITEM', 'REMOVE_ITEM', 'CHANGE_ITEM', 'PRICE_ADJUSTMENT', 'TERMS_CHANGE');

-- CreateEnum
CREATE TYPE "REMINDER_TYPE" AS ENUM ('RENEWAL_DUE', 'PAYMENT_DUE', 'RETURN_DUE', 'FOLLOW_UP', 'MAINTENANCE', 'COMPLIANCE_CHECK');

-- CreateEnum
CREATE TYPE "REMINDER_STATUS" AS ENUM ('PENDING', 'SENT', 'ACKNOWLEDGED', 'SNOOZED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "REMINDER_PRIORITY" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "contractNumber" TEXT,
ADD COLUMN     "isRenewal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentRentalId" TEXT;

-- CreateTable
CREATE TABLE "RentalRenewal" (
    "id" TEXT NOT NULL,
    "originalRentalId" TEXT NOT NULL,
    "newRentalId" TEXT NOT NULL,
    "renewalType" "RENEWAL_TYPE" NOT NULL,
    "previousEndDate" TIMESTAMP(3) NOT NULL,
    "newEndDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalModification" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "modificationType" "MODIFICATION_TYPE" NOT NULL,
    "description" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalModification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalReminder" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "reminderType" "REMINDER_TYPE" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "sentDate" TIMESTAMP(3),
    "status" "REMINDER_STATUS" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "priority" "REMINDER_PRIORITY" NOT NULL DEFAULT 'NORMAL',
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalStatusHistory" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "previousStatus" "TRANSACTION_STATUS",
    "newStatus" "TRANSACTION_STATUS" NOT NULL,
    "previousReturnStatus" "RETURN_STATUS",
    "newReturnStatus" "RETURN_STATUS",
    "changeReason" TEXT,
    "notes" TEXT,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentExchange" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "exchangeDate" TIMESTAMP(3) NOT NULL,
    "removedItems" JSONB NOT NULL,
    "addedItems" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "priceAdjustment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "processedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentExchange_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_parentRentalId_fkey" FOREIGN KEY ("parentRentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalRenewal" ADD CONSTRAINT "RentalRenewal_originalRentalId_fkey" FOREIGN KEY ("originalRentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalRenewal" ADD CONSTRAINT "RentalRenewal_newRentalId_fkey" FOREIGN KEY ("newRentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalRenewal" ADD CONSTRAINT "RentalRenewal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalModification" ADD CONSTRAINT "RentalModification_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalModification" ADD CONSTRAINT "RentalModification_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReminder" ADD CONSTRAINT "RentalReminder_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalReminder" ADD CONSTRAINT "RentalReminder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalStatusHistory" ADD CONSTRAINT "RentalStatusHistory_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalStatusHistory" ADD CONSTRAINT "RentalStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentExchange" ADD CONSTRAINT "EquipmentExchange_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentExchange" ADD CONSTRAINT "EquipmentExchange_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
