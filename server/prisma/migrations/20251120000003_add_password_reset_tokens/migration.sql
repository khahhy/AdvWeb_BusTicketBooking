-- AlterTable
ALTER TABLE "Users" ADD COLUMN "resetToken" TEXT,
ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Users_resetToken_key" ON "Users"("resetToken");
