/*
  Warnings:

  - You are about to drop the column `cashAcompte` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cashRest` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cashRestDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cashTotal` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "cashAcompte",
DROP COLUMN "cashRest",
DROP COLUMN "cashRestDate",
DROP COLUMN "cashTotal",
ADD COLUMN     "cashFrequency" TEXT,
ADD COLUMN     "cashInstallmentAmount" DOUBLE PRECISION,
ADD COLUMN     "cashInstallments" INTEGER,
ADD COLUMN     "cashNextDueDate" TIMESTAMP(3),
ADD COLUMN     "chequeFrequency" TEXT,
ADD COLUMN     "chequeInstallments" INTEGER,
ADD COLUMN     "chequeNextDueDate" TIMESTAMP(3),
ADD COLUMN     "chequeSerialStart" TEXT,
ADD COLUMN     "traiteFrequency" TEXT,
ADD COLUMN     "traiteNextDueDate" TIMESTAMP(3),
ADD COLUMN     "traiteReference" TEXT,
ADD COLUMN     "virementBankAccount" TEXT,
ADD COLUMN     "virementFrequency" TEXT,
ADD COLUMN     "virementNextDueDate" TIMESTAMP(3),
ADD COLUMN     "virementReference" TEXT;
