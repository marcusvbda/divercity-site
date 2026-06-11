CREATE TABLE "component_instances" (
  "id" SERIAL NOT NULL,
  "templateComponentId" INTEGER NOT NULL,
  CONSTRAINT "component_instances_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "component_instances_templateComponentId_fkey"
    FOREIGN KEY ("templateComponentId") REFERENCES "content_components"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "component_instance_field_values" (
  "id" SERIAL NOT NULL,
  "value" TEXT,
  "instanceId" INTEGER NOT NULL,
  "fieldId" INTEGER NOT NULL,
  CONSTRAINT "component_instance_field_values_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "component_instance_field_values_instanceId_fkey"
    FOREIGN KEY ("instanceId") REFERENCES "component_instances"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "component_instance_field_values_fieldId_fkey"
    FOREIGN KEY ("fieldId") REFERENCES "component_fields"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

ALTER TABLE "component_field_values"
  ADD COLUMN "instanceId" INTEGER,
  ADD CONSTRAINT "component_field_values_instanceId_fkey"
    FOREIGN KEY ("instanceId") REFERENCES "component_instances"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
