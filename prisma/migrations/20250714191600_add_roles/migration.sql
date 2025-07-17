/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Technician` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Technician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Technician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Technician` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'EMPLOYEE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Technician_email_key" ON "Technician"("email");
