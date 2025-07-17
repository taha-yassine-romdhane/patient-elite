/*
  Warnings:

  - You are about to drop the column `cnam` on the `Patient` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Affiliation" AS ENUM ('CNSS', 'CNRPS');

-- CreateEnum
CREATE TYPE "Beneficiary" AS ENUM ('SOCIAL_INSURED', 'SPOUSE', 'CHILD', 'ANCESTOR');

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "cnam",
ADD COLUMN     "affiliation" "Affiliation",
ADD COLUMN     "beneficiary" "Beneficiary",
ADD COLUMN     "cnamId" TEXT,
ADD COLUMN     "hasCnam" BOOLEAN NOT NULL DEFAULT false;
