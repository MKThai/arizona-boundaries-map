-- Extend officials table for multi-source canonical schema
ALTER TABLE "officials" ADD COLUMN "external_id" TEXT;
ALTER TABLE "officials" ADD COLUMN "given_name" TEXT;
ALTER TABLE "officials" ADD COLUMN "family_name" TEXT;
ALTER TABLE "officials" ADD COLUMN "level" TEXT NOT NULL DEFAULT 'state';
ALTER TABLE "officials" ADD COLUMN "gov_branch" TEXT NOT NULL DEFAULT 'executive';
ALTER TABLE "officials" ADD COLUMN "role_type" TEXT NOT NULL DEFAULT 'official';
ALTER TABLE "officials" ADD COLUMN "jurisdiction_ocd" TEXT;
ALTER TABLE "officials" ADD COLUMN "jurisdiction_name" TEXT;
ALTER TABLE "officials" ADD COLUMN "term_start" TIMESTAMP(3);
ALTER TABLE "officials" ADD COLUMN "term_end" TIMESTAMP(3);
ALTER TABLE "officials" ADD COLUMN "is_appointed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "officials" ADD COLUMN "source_url" TEXT;
ALTER TABLE "officials" ADD COLUMN "raw_payload" JSONB;

-- Backfill from legacy branch column
UPDATE "officials" SET "gov_branch" = "branch" WHERE "branch" IS NOT NULL;
UPDATE "officials" SET "level" = 'state' WHERE "source" IN ('openstates', 'manual');
UPDATE "officials" SET "role_type" = 'senator' WHERE "chamber" = 'senate';
UPDATE "officials" SET "role_type" = 'representative' WHERE "chamber" = 'house';
UPDATE "officials" SET "role_type" = 'governor' WHERE "title" = 'Governor';
UPDATE "officials" SET "role_type" = 'secretary_of_state' WHERE "title" = 'Secretary of State';
UPDATE "officials" SET "role_type" = 'attorney_general' WHERE "title" = 'Attorney General';
UPDATE "officials" SET "role_type" = 'treasurer' WHERE "title" = 'Treasurer';
UPDATE "officials" SET "role_type" = 'superintendent' WHERE "title" LIKE 'Supt.%';
UPDATE "officials" SET "role_type" = 'mine_inspector' WHERE "title" = 'Mine Inspector';

ALTER TABLE "officials" DROP COLUMN "branch";

ALTER TABLE "officials" ALTER COLUMN "party" DROP NOT NULL;

CREATE UNIQUE INDEX "officials_external_id_source_key" ON "officials"("external_id", "source");
CREATE INDEX "officials_state_level_gov_branch_idx" ON "officials"("state", "level", "gov_branch");

CREATE TABLE "official_contacts" (
    "id" SERIAL NOT NULL,
    "official_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,

    CONSTRAINT "official_contacts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "official_contacts" ADD CONSTRAINT "official_contacts_official_id_fkey" FOREIGN KEY ("official_id") REFERENCES "officials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
