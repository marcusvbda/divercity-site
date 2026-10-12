-- Remove CMS business hours fields (now managed by the business_hours registry)

DELETE FROM "component_instance_field_values"
WHERE "fieldId" IN (
  SELECT cf."id"
  FROM "component_fields" cf
  JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cf."name" IN ('weekdaysTime', 'holidaysTime')
    AND cc."name" = 'Info'
    AND ct."name" IN ('ContactSection', 'Footer')
);

DELETE FROM "component_field_values"
WHERE "componentFieldId" IN (
  SELECT cf."id"
  FROM "component_fields" cf
  JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cf."name" IN ('weekdaysTime', 'holidaysTime')
    AND cc."name" = 'Info'
    AND ct."name" IN ('ContactSection', 'Footer')
);

DELETE FROM "component_fields"
WHERE "id" IN (
  SELECT cf."id"
  FROM "component_fields" cf
  JOIN "content_components" cc ON cc."id" = cf."contentComponentId"
  JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
  WHERE cf."name" IN ('weekdaysTime', 'holidaysTime')
    AND cc."name" = 'Info'
    AND ct."name" IN ('ContactSection', 'Footer')
);
