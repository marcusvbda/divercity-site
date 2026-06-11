import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getContentType(type: string): Promise<any> {
  "use cache";
  cacheTag("cms", `cms:${type}`);
  cacheLife("hours");

  const contentType = await prisma.contentType.findUnique({
    where: { name: type },
    include: {
      components: {
        include: {
          fields: {
            include: { values: true },
          },
        },
      },
    },
  });

  if (!contentType) return null;

  const result: Record<string, Record<string, string | null>> = {};

  for (const component of contentType.components) {
    const map: Record<string, string | null> = {};
    for (const field of component.fields) {
      map[field.name] = field.values[0]?.value ?? null;
    }
    result[component.name] = map;
  }

  return result;
}
