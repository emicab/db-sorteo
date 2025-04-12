-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_prizeId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_raffleId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
