-- AlterEnum - Add new value to UserStatus
ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'unverified';

-- AlterTable - Add new columns to Users table
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "verificationToken" TEXT,
ADD COLUMN IF NOT EXISTS "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex - Add unique constraint on verificationToken
CREATE UNIQUE INDEX IF NOT EXISTS "Users_verificationToken_key" ON "Users"("verificationToken");
