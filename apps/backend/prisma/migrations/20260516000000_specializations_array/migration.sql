-- AlterTable: specialization -> specializations (String array)
-- Add new specializations column
ALTER TABLE "psychologists" ADD COLUMN IF NOT EXISTS "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Migrate existing specialization data into the array
UPDATE "psychologists" SET "specializations" = ARRAY["specialization"] WHERE "specialization" IS NOT NULL AND "specialization" != '';

-- Make old specialization column nullable for backwards compat
ALTER TABLE "psychologists" ALTER COLUMN "specialization" DROP NOT NULL;
ALTER TABLE "psychologists" ALTER COLUMN "specialization" SET DEFAULT '';
