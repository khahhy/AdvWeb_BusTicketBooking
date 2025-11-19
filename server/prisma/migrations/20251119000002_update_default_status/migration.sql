-- Update default status to unverified
ALTER TABLE "Users" ALTER COLUMN "status" SET DEFAULT 'unverified'::"UserStatus";
