/*
  Warnings:

  - You are about to drop the column `rentalGroupId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `parentRentalId` on the `Rental` table. All the data in the column will be lost.
  - You are about to drop the column `rentalGroupId` on the `RentalItem` table. All the data in the column will be lost.
  - You are about to drop the `EquipmentExchange` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RentalGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RentalModification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RentalRenewal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RentalStatusHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EquipmentExchange" DROP CONSTRAINT "EquipmentExchange_processedById_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentExchange" DROP CONSTRAINT "EquipmentExchange_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_rentalGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Rental" DROP CONSTRAINT "Rental_parentRentalId_fkey";

-- DropForeignKey
ALTER TABLE "RentalGroup" DROP CONSTRAINT "RentalGroup_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "RentalItem" DROP CONSTRAINT "RentalItem_rentalGroupId_fkey";

-- DropForeignKey
ALTER TABLE "RentalModification" DROP CONSTRAINT "RentalModification_createdById_fkey";

-- DropForeignKey
ALTER TABLE "RentalModification" DROP CONSTRAINT "RentalModification_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "RentalRenewal" DROP CONSTRAINT "RentalRenewal_createdById_fkey";

-- DropForeignKey
ALTER TABLE "RentalRenewal" DROP CONSTRAINT "RentalRenewal_newRentalId_fkey";

-- DropForeignKey
ALTER TABLE "RentalRenewal" DROP CONSTRAINT "RentalRenewal_originalRentalId_fkey";

-- DropForeignKey
ALTER TABLE "RentalStatusHistory" DROP CONSTRAINT "RentalStatusHistory_changedById_fkey";

-- DropForeignKey
ALTER TABLE "RentalStatusHistory" DROP CONSTRAINT "RentalStatusHistory_rentalId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "rentalGroupId";

-- AlterTable
ALTER TABLE "Rental" DROP COLUMN "parentRentalId",
ADD COLUMN     "autoRenewalSettings" JSONB,
ADD COLUMN     "earlyReturnAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "earlyReturnPenalty" DOUBLE PRECISION,
ADD COLUMN     "equipmentExchangeAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insuranceRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "lateReturnPenalty" DOUBLE PRECISION,
ADD COLUMN     "maintenanceIncluded" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "renewalType" "RENEWAL_TYPE" NOT NULL DEFAULT 'EXTENSION',
ADD COLUMN     "userNotes" TEXT;

-- AlterTable
ALTER TABLE "RentalItem" DROP COLUMN "rentalGroupId";

-- DropTable
DROP TABLE "EquipmentExchange";

-- DropTable
DROP TABLE "RentalGroup";

-- DropTable
DROP TABLE "RentalModification";

-- DropTable
DROP TABLE "RentalRenewal";

-- DropTable
DROP TABLE "RentalStatusHistory";
