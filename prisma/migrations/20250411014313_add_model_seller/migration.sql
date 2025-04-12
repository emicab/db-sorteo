/*
  Warnings:

  - You are about to drop the `_SellerToTicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SellerToTicket" DROP CONSTRAINT "_SellerToTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_SellerToTicket" DROP CONSTRAINT "_SellerToTicket_B_fkey";

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_SellerToTicket";
