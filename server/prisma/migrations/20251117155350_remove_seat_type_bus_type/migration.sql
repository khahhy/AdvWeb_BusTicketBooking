/*
  Warnings:

  - You are about to drop the column `busType` on the `Buses` table. All the data in the column will be lost.
  - You are about to drop the column `seatType` on the `Seats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Buses" DROP COLUMN "busType";

-- AlterTable
ALTER TABLE "Seats" DROP COLUMN "seatType";

-- DropEnum
DROP TYPE "SeatType";
