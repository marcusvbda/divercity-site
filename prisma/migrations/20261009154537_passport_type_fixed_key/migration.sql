-- AlterTable
ALTER TABLE "passport_types" ADD COLUMN "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "passport_types_key_key" ON "passport_types"("key");

-- Backfill fixed passports by duration
UPDATE "passport_types" SET "key" = 'passport_30min', "active" = true WHERE "id" = (SELECT "id" FROM "passport_types" WHERE "durationMinutes" = 30 AND "key" IS NULL ORDER BY "sort", "createdAt" LIMIT 1);
UPDATE "passport_types" SET "key" = 'passport_1h', "active" = true WHERE "id" = (SELECT "id" FROM "passport_types" WHERE "durationMinutes" = 60 AND "key" IS NULL ORDER BY "sort", "createdAt" LIMIT 1);
UPDATE "passport_types" SET "key" = 'passport_2h', "active" = true WHERE "id" = (SELECT "id" FROM "passport_types" WHERE "durationMinutes" = 120 AND "key" IS NULL ORDER BY "sort", "createdAt" LIMIT 1);
UPDATE "passport_types" SET "key" = 'passport_3h', "active" = true WHERE "id" = (SELECT "id" FROM "passport_types" WHERE "durationMinutes" = 180 AND "key" IS NULL ORDER BY "sort", "createdAt" LIMIT 1);
