-- AlterTable: Psikolog profil alanları eklendi
ALTER TABLE "psychologists" ADD COLUMN "educationInfo" TEXT;
ALTER TABLE "psychologists" ADD COLUMN "experienceYears" INTEGER;
ALTER TABLE "psychologists" ADD COLUMN "certificates" TEXT;
