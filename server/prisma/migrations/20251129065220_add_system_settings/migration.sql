-- CreateEnum
CREATE TYPE "SettingKey" AS ENUM ('GENERAL', 'BOOKING_RULES', 'BUS_AMENITIES', 'PAYMENT_GATEWAYS');

-- CreateTable
CREATE TABLE "SystemSettings" (
    "key" "SettingKey" NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("key")
);
