-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "isOverdue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overdueDate" TIMESTAMP(3),
ADD COLUMN     "overdueDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentalGroupId" TEXT;

-- AlterTable
ALTER TABLE "RentalItem" ADD COLUMN     "rentalGroupId" TEXT;

-- CreateTable
CREATE TABLE "RentalGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "rentalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_rentalGroupId_fkey" FOREIGN KEY ("rentalGroupId") REFERENCES "RentalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalGroup" ADD CONSTRAINT "RentalGroup_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_rentalGroupId_fkey" FOREIGN KEY ("rentalGroupId") REFERENCES "RentalGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
