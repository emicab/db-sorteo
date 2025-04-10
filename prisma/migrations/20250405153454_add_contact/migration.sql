/*
  Warnings:

  - Added the required column `alias` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsapp` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "whatsapp" TEXT NOT NULL;
