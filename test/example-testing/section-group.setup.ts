import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";
import { IsZodMigratorValid } from "../../src/types/types";
import { Merge, Simplify } from "type-fest";
import {
  sectionMigrator,
  sectionSchemaV4,
  SectionV1,
  SectionV2,
  SectionV3,
  SectionV4,
  SectionWithChildren,
} from "./section.setup";

export const initialSectionGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("SECTION_GROUP"),
});

export const sectionGroupSchemaV2 = initialSectionGroupSchema.merge(
  z.object({
    sections: z.array(sectionSchemaV4),
  })
);

export type SectionGroupV1 = z.infer<typeof initialSectionGroupSchema>;
export type SectionGroupV2 = Simplify<
  Merge<
    z.infer<typeof sectionGroupSchemaV2>,
    {
      sections: (SectionV1 | SectionV2 | SectionV3)[];
    }
  >
>;

export type SectionGroupV3 = Simplify<
  Merge<
    z.infer<typeof sectionGroupSchemaV3>,
    {
      sections: (SectionV1 | SectionV2 | SectionV3 | SectionV4)[];
    }
  >
>;

export type SectionGroupV4 = z.infer<typeof sectionGroupSchemaV4>;
export type SectionGroupWithChildren = SectionGroupV4 & {
  sections: SectionWithChildren[];
};

export const sectionGroupSchemaV3 = sectionGroupSchemaV2.merge(
  z.object({
    subheaderFontFamily: z.string(),
    subheaderFontSize: z.number(),
  })
);

export const sectionGroupSchemaV4 = sectionGroupSchemaV3
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

export const sectionGroupMigrator = createZodMigrations({
  startingSchema: initialSectionGroupSchema,
  endingSchema: sectionGroupSchemaV4,
})
  .addNestedArray({
    nestedMigrator: sectionMigrator,
    path: "sections",
    schema: sectionSchemaV4,
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
  return true as IsZodMigratorValid<typeof sectionGroupMigrator>;
}
