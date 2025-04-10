/*
  Warnings:

  - You are about to drop the column `name` on the `Raffle` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Raffle` table. All the data in the column will be lost.
  - Added the required column `date` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerNumber` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalNumbers` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winnersCount` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" DROP COLUMN "name",
DROP COLUMN "price",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "pricePerNumber" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "totalNumbers" INTEGER NOT NULL,
ADD COLUMN     "winnersCount" INTEGER NOT NULL;
