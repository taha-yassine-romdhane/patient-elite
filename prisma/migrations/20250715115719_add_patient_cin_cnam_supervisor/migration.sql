-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "cin" TEXT,
ADD COLUMN     "cnam" TEXT,
ADD COLUMN     "supervisorId" TEXT;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
