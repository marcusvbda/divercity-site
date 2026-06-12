import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getContentType(type: string): Promise<any> {
  "use cache";
  cacheTag("cms", `cms:${type}`);
  cacheLife("max");

  const contentType = await prisma.contentType.findUnique({
    where: { name: type },
    include: {
      components: {
        include: {
          fields: {
            include: {
              values: {
                include: {
                  instance: {
                    include: {
                      fieldValues: { include: { field: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!contentType) return null;

  const result: Record<string, Record<string, any>> = {};

  for (const component of contentType.components) {
    const map: Record<string, any> = {};

    for (const field of component.fields) {
      if (field.type === "multiple") {
        map[field.name] = field.values.map((v) => {
          if (v.instance) {
            const instanceData: Record<string, string | null> = {};
            for (const ifv of v.instance.fieldValues) {
              instanceData[ifv.field.name] = ifv.value ?? null;
            }
            return { id: v.id, value: instanceData };
          }
          return {
            id: v.id,
            value: v.type === "json" ? JSON.parse(v.value ?? "null") : (v.value ?? ""),
          };
        });
      } else {
        const v = field.values[0] ?? null;
        if (!v) {
          map[field.name] = null;
        } else if (v.instance) {
          const instanceData: Record<string, string | null> = {};
          for (const ifv of v.instance.fieldValues) {
            instanceData[ifv.field.name] = ifv.value ?? null;
          }
          map[field.name] = { id: v.id, value: instanceData };
        } else {
          map[field.name] = {
            id: v.id,
            value: v.type === "json" ? JSON.parse(v.value ?? "null") : (v.value ?? null),
          };
        }
      }
    }

    result[component.name] = map;
  }

  return result;
}
