-- CreateTable
CREATE TABLE "content_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "content_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_components" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'simple',
    "contentTypeId" INTEGER NOT NULL,

    CONSTRAINT "content_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_fields" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contentComponentId" INTEGER NOT NULL,

    CONSTRAINT "component_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_field_values" (
    "id" SERIAL NOT NULL,
    "value" TEXT,
    "componentFieldId" INTEGER NOT NULL,

    CONSTRAINT "component_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_types_name_key" ON "content_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "content_components_name_contentTypeId_key" ON "content_components"("name", "contentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "component_fields_name_contentComponentId_key" ON "component_fields"("name", "contentComponentId");

-- AddForeignKey
ALTER TABLE "content_components" ADD CONSTRAINT "content_components_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "content_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_fields" ADD CONSTRAINT "component_fields_contentComponentId_fkey" FOREIGN KEY ("contentComponentId") REFERENCES "content_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_field_values" ADD CONSTRAINT "component_field_values_componentFieldId_fkey" FOREIGN KEY ("componentFieldId") REFERENCES "component_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
