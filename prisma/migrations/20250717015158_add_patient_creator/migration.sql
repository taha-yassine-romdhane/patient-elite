-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
