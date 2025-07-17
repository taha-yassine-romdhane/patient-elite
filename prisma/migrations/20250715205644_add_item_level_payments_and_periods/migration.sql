-- CreateEnum
CREATE TYPE "RENTAL_ITEM_TYPE" AS ENUM ('DEVICE', 'ACCESSORY');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cnamFollowupDate" TIMESTAMP(3),
ADD COLUMN     "cnamStatus" TEXT,
ADD COLUMN     "periodEndDate" TIMESTAMP(3),
ADD COLUMN     "periodStartDate" TIMESTAMP(3),
ADD COLUMN     "rentalItemId" TEXT;

-- AlterTable
ALTER TABLE "Rental" ALTER COLUMN "notes" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RentalItem" (
    "id" TEXT NOT NULL,
    "itemType" "RENTAL_ITEM_TYPE" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "rentalId" TEXT NOT NULL,
    "deviceId" TEXT,
    "accessoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalItemId_fkey" FOREIGN KEY ("rentalItemId") REFERENCES "RentalItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
