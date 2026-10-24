-- Add General/Price.dayType (weekday | weekend) so the price section matches CMS groups to passport prices by value, not by position

INSERT INTO "component_fields" ("name", "type", "contentComponentId")
SELECT 'dayType', 'simple', cc."id"
FROM "content_components" cc
JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
WHERE cc."name" = 'Price'
  AND ct."name" = 'General'
ON CONFLICT ("name", "contentComponentId") DO NOTHING;

INSERT INTO "component_instance_field_values" ("value", "instanceId", "fieldId")
SELECT
  CASE WHEN tv."value" ILIKE 'Segunda a Quinta%' THEN 'weekday' ELSE 'weekend' END,
  i."id",
  df."id"
FROM "component_instances" i
JOIN "component_fields" df
  ON df."contentComponentId" = i."templateComponentId" AND df."name" = 'dayType'
JOIN "component_instance_field_values" tv ON tv."instanceId" = i."id"
JOIN "component_fields" tf ON tf."id" = tv."fieldId" AND tf."name" = 'title'
WHERE NOT EXISTS (
  SELECT 1
  FROM "component_instance_field_values" existing
  WHERE existing."instanceId" = i."id" AND existing."fieldId" = df."id"
);
