-- Remove CMS PartySection.CTAs.ctaPrices field (button removed from the party section)

CREATE TEMP TABLE "_party_cta_prices_instances" AS
SELECT DISTINCT cfv."instanceId" AS "id"
FROM "component_field_values" cfv
JOIN "component_fields" cf ON cf."id" = cfv."componentFieldId"
JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
WHERE cf."name" = 'ctaPrices'
  AND cc."name" = 'CTAs'
  AND ct."name" = 'PartySection'
  AND cfv."instanceId" IS NOT NULL;

DELETE FROM "component_field_values"
WHERE "componentFieldId" IN (
  SELECT cf."id"
  FROM "component_fields" cf
  JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cf."name" = 'ctaPrices'
    AND cc."name" = 'CTAs'
    AND ct."name" = 'PartySection'
);

DELETE FROM "component_instances"
WHERE "id" IN (SELECT "id" FROM "_party_cta_prices_instances");

DELETE FROM "component_fields"
WHERE "id" IN (
  SELECT cf."id"
  FROM "component_fields" cf
  JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cf."name" = 'ctaPrices'
    AND cc."name" = 'CTAs'
    AND ct."name" = 'PartySection'
);

DROP TABLE "_party_cta_prices_instances";
