-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_userId_fkey";

-- AlterTable
ALTER TABLE "Bookings" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Bookings_ticketCode_idx" ON "Bookings"("ticketCode");

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
