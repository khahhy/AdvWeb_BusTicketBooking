-- CreateEnum
CREATE TYPE "BusType" AS ENUM ('standard', 'vip', 'sleeper', 'limousine');

-- AlterTable
ALTER TABLE "Buses" ADD COLUMN     "busType" "BusType" NOT NULL DEFAULT 'standard';
