/*
  Warnings:

  - The primary key for the `SeatSegmentLocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SeatSegmentLocks` table. All the data in the column will be lost.
  - The primary key for the `TripRouteMap` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TripRouteMap` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SeatSegmentLocks_tripId_seatId_segmentId_key";

-- DropIndex
DROP INDEX "TripRouteMap_tripId_routeId_key";

-- AlterTable
ALTER TABLE "SeatSegmentLocks" DROP CONSTRAINT "SeatSegmentLocks_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SeatSegmentLocks_pkey" PRIMARY KEY ("tripId", "seatId", "segmentId");

-- AlterTable
ALTER TABLE "TripRouteMap" DROP CONSTRAINT "TripRouteMap_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "TripRouteMap_pkey" PRIMARY KEY ("tripId", "routeId");
