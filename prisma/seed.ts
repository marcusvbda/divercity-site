import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DIRECT_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const metadataType = await prisma.contentType.upsert({
    where: { name: "Metadata" },
    update: {},
    create: { name: "Metadata" },
  });

  const seoComponent = await prisma.contentComponent.upsert({
    where: { name_contentTypeId: { name: "SEO", contentTypeId: metadataType.id } },
    update: {},
    create: { name: "SEO", type: "simple", contentTypeId: metadataType.id },
  });

  const fields: { name: string; value: string }[] = [
    { name: "title",          value: "Divercity Park — Diversão para toda a família" },
    { name: "description",    value: "Divercity Park é o melhor parque indoor da região. Festas de aniversário, mais de 10 atrações, área para pais e muito mais. Reserve sua festa agora!" },
    { name: "keywords",       value: "parque infantil, festa infantil, aniversário criança, diversão indoor, Divercity Park" },
    { name: "og_title",       value: "Divercity Park — Diversão para toda a família" },
    { name: "og_description", value: "Festas inesquecíveis e mais de 10 atrações para toda a família." },
    { name: "og_image",       value: "" },
  ];

  for (const { name, value } of fields) {
    const field = await prisma.componentField.upsert({
      where: { name_contentComponentId: { name, contentComponentId: seoComponent.id } },
      update: {},
      create: { name, contentComponentId: seoComponent.id },
    });
    await prisma.componentFieldValue.upsert({
      where: { id: field.id },
      update: { value },
      create: { value, componentFieldId: field.id },
    });
  }

  console.log("Seed completo — Metadata/SEO inserido.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
