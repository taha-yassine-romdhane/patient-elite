-- DropForeignKey
ALTER TABLE "Accessory" DROP CONSTRAINT "Accessory_rentalId_fkey";

-- DropForeignKey
ALTER TABLE "Accessory" DROP CONSTRAINT "Accessory_saleId_fkey";

-- AlterTable
ALTER TABLE "Accessory" ALTER COLUMN "saleId" DROP NOT NULL,
ALTER COLUMN "rentalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE SET NULL ON UPDATE CASCADE;
