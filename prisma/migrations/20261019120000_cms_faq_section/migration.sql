-- Seed FaqSection CMS content type (data only, idempotent)
INSERT INTO "content_types" ("name") VALUES ('FaqSection')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "content_components" ("name", "contentTypeId")
SELECT 'Section', "id" FROM "content_types" WHERE "name" = 'FaqSection'
ON CONFLICT ("name", "contentTypeId") DO NOTHING;

INSERT INTO "component_fields" ("name", "type", "contentComponentId")
SELECT f."name", 'simple', cc."id"
FROM "content_components" cc
JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
CROSS JOIN (VALUES ('badge'), ('title'), ('subtitle'), ('ctaLabel')) AS f("name")
WHERE ct."name" = 'FaqSection' AND cc."name" = 'Section'
ON CONFLICT ("name", "contentComponentId") DO NOTHING;

INSERT INTO "component_field_values" ("value", "componentFieldId")
SELECT
  CASE cf."name"
    WHEN 'badge' THEN 'Dúvidas'
    WHEN 'title' THEN 'Perguntas frequentes'
    WHEN 'subtitle' THEN 'Tire suas dúvidas antes de visitar o Divercity Park.'
    WHEN 'ctaLabel' THEN 'Ver todas as perguntas'
  END,
  cf."id"
FROM "component_fields" cf
JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
WHERE ct."name" = 'FaqSection' AND cc."name" = 'Section'
  AND NOT EXISTS (
    SELECT 1 FROM "component_field_values" v WHERE v."componentFieldId" = cf."id"
  );
