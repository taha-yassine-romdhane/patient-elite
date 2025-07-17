-- AlterTable
ALTER TABLE "Diagnostic" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
