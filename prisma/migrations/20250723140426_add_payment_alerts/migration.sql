/*
  Warnings:

  - You are about to drop the column `autoRenewalSettings` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `earlyReturnAllowed` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `earlyReturnPenalty` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `equipmentExchangeAllowed` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceRequired` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `internalNotes` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `lateReturnPenalty` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceIncluded` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `renewalType` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `userNotes` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the `BundleItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentBundle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EquipmentTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RentalReminder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BundleItem" DROP CONSTRAINT "BundleItem_bundleId_fkey";

-- DropForeignKey
ALTER TABLE "BundleItem" DROP CONSTRAINT "BundleItem_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentBundle" DROP CONSTRAINT "EquipmentBundle_createdById_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentCategory" DROP CONSTRAINT "EquipmentCategory_createdById_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentTemplate" DROP CONSTRAINT "EquipmentTemplate_createdById_fkey";

-- DropForeignKey
ALTER TABLE "RentalReminder" DROP CONSTRAINT "RentalReminder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "RentalReminder" DROP CONSTRAINT "RentalReminder_rentalId_fkey";

-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cnamDebutDate" TIMESTAMP(3),
ADD COLUMN     "cnamEndDate" TIMESTAMP(3),
ADD COLUMN     "cnamSupportAmount" DOUBLE PRECISION,
ADD COLUMN     "cnamSupportMonths" INTEGER;

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "autoRenewalSettings",
DROP COLUMN "earlyReturnAllowed",
DROP COLUMN "earlyReturnPenalty",
DROP COLUMN "equipmentExchangeAllowed",
DROP COLUMN "insuranceRequired",
DROP COLUMN "internalNotes",
DROP COLUMN "lateReturnPenalty",
DROP COLUMN "maintenanceIncluded",
DROP COLUMN "renewalType",
DROP COLUMN "userNotes",
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RentalItem" ALTER COLUMN "endDate" DROP NOT NULL;

-- DropTable
DROP TABLE "BundleItem";

-- DropTable
DROP TABLE "EquipmentBundle";

-- DropTable
DROP TABLE "EquipmentCategory";

-- DropTable
DROP TABLE "EquipmentTemplate";

-- DropTable
DROP TABLE "RentalReminder";

-- DropEnum
DROP TYPE "MODIFICATION_TYPE";

-- DropEnum
DROP TYPE "REMINDER_PRIORITY";

-- DropEnum
DROP TYPE "REMINDER_STATUS";

-- DropEnum
DROP TYPE "REMINDER_TYPE";

-- DropEnum
DROP TYPE "RENEWAL_TYPE";

-- CreateTable
CREATE TABLE "PaymentAlert" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAlert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentAlert" ADD CONSTRAINT "PaymentAlert_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
