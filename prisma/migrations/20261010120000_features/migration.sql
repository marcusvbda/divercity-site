-- CreateTable
CREATE TABLE "features" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("key")
);


-- Seed default features
INSERT INTO "features" ("key", "name", "enabled", "updatedAt") VALUES
    ('advance_purchase', 'Compra antecipada', true, now()),
    ('party_budget', 'Orçamento de festa', true, now())
ON CONFLICT ("key") DO NOTHING;
