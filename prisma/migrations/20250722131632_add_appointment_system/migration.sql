-- CreateEnum
CREATE TYPE "APPOINTMENT_TYPE" AS ENUM ('RENTAL', 'SALE', 'DIAGNOSTIC', 'FOLLOW_UP', 'MAINTENANCE', 'CONSULTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "APPOINTMENT_STATUS" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- AlterEnum
ALTER TYPE "RENTAL_ITEM_TYPE" ADD VALUE 'CONSUMABLE';

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "type" "APPOINTMENT_TYPE" NOT NULL,
    "status" "APPOINTMENT_STATUS" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "rentalId" TEXT,
    "saleId" TEXT,
    "diagnosticId" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "Diagnostic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
