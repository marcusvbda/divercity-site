-- CreateTable
CREATE TABLE "business_hours" (
    "id" SERIAL NOT NULL,
    "key" TEXT,
    "label" TEXT NOT NULL,
    "opening" INTEGER NOT NULL,
    "close" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_key_key" ON "business_hours"("key");

-- Copy current hours from the CMS (Footer > Info), falling back to defaults
INSERT INTO "business_hours" ("key", "label", "opening", "close", "updatedAt")
SELECT
    d."key",
    d."label",
    CASE WHEN p."o" BETWEEN 0 AND 23 AND p."c" BETWEEN 1 AND 24 AND p."c" > p."o" THEN p."o" ELSE d."fallbackOpening" END,
    CASE WHEN p."o" BETWEEN 0 AND 23 AND p."c" BETWEEN 1 AND 24 AND p."c" > p."o" THEN p."c" ELSE d."fallbackClose" END,
    CURRENT_TIMESTAMP
FROM (
    VALUES
        (1, 'weekdays', 'Segunda a Sábado', 'weekdaysTime', 10, 22),
        (2, 'sundays_holidays', 'Domingos e feriados', 'holidaysTime', 12, 20)
) AS d ("ord", "key", "label", "field", "fallbackOpening", "fallbackClose")
LEFT JOIN LATERAL (
    SELECT regexp_match(v."value", '(\d{1,2})\s*h\s*às\s*(\d{1,2})\s*h') AS "m"
    FROM "component_field_values" v
    JOIN "component_fields" f ON f."id" = v."componentFieldId"
    JOIN "content_components" cc ON cc."id" = f."contentComponentId"
    JOIN "content_types" ct ON ct."id" = cc."contentTypeId"
    WHERE ct."name" = 'Footer'
      AND cc."name" = 'Info'
      AND f."name" = d."field"
      AND v."instanceId" IS NULL
    ORDER BY v."id"
    LIMIT 1
) src ON TRUE
LEFT JOIN LATERAL (
    SELECT (src."m")[1]::INTEGER AS "o", (src."m")[2]::INTEGER AS "c"
) p ON TRUE
ORDER BY d."ord";
