/*
  Warnings:

  - A unique constraint covering the columns `[shortCode]` on the table `Raffle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Raffle" ADD COLUMN     "shortCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Raffle_shortCode_key" ON "Raffle"("shortCode");
