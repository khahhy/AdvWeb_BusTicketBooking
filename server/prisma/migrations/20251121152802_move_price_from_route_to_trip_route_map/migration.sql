/*
  Warnings:

  - You are about to drop the column `price` on the `Routes` table. All the data in the column will be lost.
  - Added the required column `price` to the `TripRouteMap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Routes" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "TripRouteMap" ADD COLUMN     "price" DECIMAL(65,30) NOT NULL;
