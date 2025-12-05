/*
  Warnings:

  - You are about to drop the column `seatCapacity` on the `Buses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Buses" DROP COLUMN "seatCapacity";

-- DropEnum
DROP TYPE "SeatCapacity";
