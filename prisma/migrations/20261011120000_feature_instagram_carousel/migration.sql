-- Seed instagram_carousel feature
INSERT INTO "features" ("key", "name", "enabled", "updatedAt") VALUES
    ('instagram_carousel', 'Carousel do Instagram', true, now())
ON CONFLICT ("key") DO NOTHING;
