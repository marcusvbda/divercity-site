-- Remove CMS price tiers (PriceSection/Tiers, AdvancePurchaseSection/Tiers, General/Tier) and unused service party_companion.
-- Data-only migration; ordered by FK (only component_instance_field_values -> component_instances cascades).

-- 1. Field values pointing at the Tiers fields (references to tier instances)
DELETE FROM "component_field_values"
WHERE "componentFieldId" IN (
  SELECT cf."id"
  FROM "component_fields" cf
  JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cc."name" = 'Tiers' AND ct."name" IN ('PriceSection', 'AdvancePurchaseSection')
);

-- 2. Tier instances (cascades to component_instance_field_values)
DELETE FROM "component_instances"
WHERE "templateComponentId" IN (
  SELECT cc."id"
  FROM "content_components" cc
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cc."name" = 'Tier' AND ct."name" = 'General'
);

-- 3. Fields of the Tiers components and the General/Tier template
DELETE FROM "component_fields"
WHERE "contentComponentId" IN (
  SELECT cc."id"
  FROM "content_components" cc
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE (cc."name" = 'Tiers' AND ct."name" IN ('PriceSection', 'AdvancePurchaseSection'))
     OR (cc."name" = 'Tier' AND ct."name" = 'General')
);

-- 4. The components themselves
DELETE FROM "content_components"
WHERE "id" IN (
  SELECT cc."id"
  FROM "content_components" cc
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE (cc."name" = 'Tiers' AND ct."name" IN ('PriceSection', 'AdvancePurchaseSection'))
     OR (cc."name" = 'Tier' AND ct."name" = 'General')
);

-- 5. Unused service
DELETE FROM "services" WHERE "key" = 'party_companion';
