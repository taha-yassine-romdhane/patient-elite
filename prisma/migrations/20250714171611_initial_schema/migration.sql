-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "polygraphResult" INTEGER NOT NULL,
    "technicianId" TEXT NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CpapInstallation" (
    "id" TEXT NOT NULL,
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "device" TEXT,
    "serialNumber" TEXT,
    "otherInfo" TEXT,
    "payment" TEXT,
    "notes" TEXT,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "CpapInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technician_name_key" ON "Technician"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CpapInstallation_patientId_key" ON "CpapInstallation"("patientId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CpapInstallation" ADD CONSTRAINT "CpapInstallation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
