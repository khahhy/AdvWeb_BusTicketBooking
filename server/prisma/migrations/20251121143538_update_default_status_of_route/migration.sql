-- AlterTable
ALTER TABLE "Locations" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Routes" ALTER COLUMN "isActive" SET DEFAULT false;
