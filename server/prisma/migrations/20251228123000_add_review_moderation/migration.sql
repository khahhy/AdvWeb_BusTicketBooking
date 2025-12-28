-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('visible', 'hidden', 'flagged');

-- AlterTable
ALTER TABLE "Reviews" ADD COLUMN "status" "ReviewStatus" NOT NULL DEFAULT 'visible';
ALTER TABLE "Reviews" ADD COLUMN "flaggedReason" TEXT;
ALTER TABLE "Reviews" ADD COLUMN "moderatedAt" TIMESTAMP(3);
ALTER TABLE "Reviews" ADD COLUMN "moderatedBy" TEXT;
