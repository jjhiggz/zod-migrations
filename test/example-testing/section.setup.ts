import { z } from "zod";
import {
  itemMigratorToV3,
  ItemV1,
  ItemV2,
  ItemV3,
  itemV3Schema,
} from "./item.setup";
import { createZodMigrations } from "../../src/zod-migration";
import { IsZodMigratorValid } from "../../src/types/types";
import { Merge, Simplify } from "type-fest";

export const initialSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("SECTION"),
});

export const sectionSchemaV2 = initialSectionSchema.merge(
  z.object({
    items: z.array(itemV3Schema),
  })
);

export type SectionV1 = z.infer<typeof initialSectionSchema>;
export type SectionV2 = Simplify<
  Merge<
    z.infer<typeof sectionSchemaV2>,
    {
      items: (ItemV1 | ItemV2 | ItemV3)[];
    }
  >
>;
export type SectionV3 = Simplify<
  Merge<
    z.infer<typeof sectionSchemaV3>,
    {
      items: (ItemV1 | ItemV2 | ItemV3)[];
    }
  >
>;

export type SectionV4 = z.infer<typeof sectionSchemaV4>;
export type SectionWithChildren = SectionV4 & {
  items: ItemV3[];
};

export const sectionSchemaV3 = sectionSchemaV2.merge(
  z.object({
    subheaderFontFamily: z.string(),
    subheaderFontSize: z.number(),
  })
);

export const sectionSchemaV4 = sectionSchemaV3
  .omit({
    subheaderFontFamily: true,
    subheaderFontSize: true,
  })
  .merge(
    z.object({
      sectionHeaderFontFamily: z.string(),
      sectionHeaderFontSize: z.number(),
    })
  );

export const sectionMigrator = createZodMigrations({
  startingSchema: initialSectionSchema,
  endingSchema: sectionSchemaV4,
})
  .addNestedArray({
    nestedMigrator: itemMigratorToV3,
    path: "items",
    schema: itemV3Schema,
  })
  .addMany({
    schema: z.object({
      subheaderFontFamily: z.string(),
      subheaderFontSize: z.number(),
    }),
    defaultValues: {
      subheaderFontFamily: "Default Font",
      subheaderFontSize: 12,
    },
  })
  .renameMany({
    subheaderFontFamily: "sectionHeaderFontFamily",
    subheaderFontSize: "sectionHeaderFontSize",
  } as const);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValid(): true {
  //   type InferredFromSchema = z.infer<typeof sectionSchemaV4>;
  //   type InferredFromMigrator = ZodMigratorEndShape<typeof sectionMigrator>;
  return true as IsZodMigratorValid<typeof sectionMigrator>;
}
