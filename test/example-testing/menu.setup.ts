import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";
import { IsZodMigratorValid } from "../../src/types/types";
import { Merge, Simplify } from "type-fest";
import {
  sectionGroupMigrator,
  sectionGroupSchemaV4,
  SectionGroupV1,
  SectionGroupV2,
  SectionGroupV3,
  SectionGroupV4,
  SectionGroupWithChildren,
} from "./section-group.setup";
import { Equals } from "../../src/types/Equals";

export const initialMenuSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("MENU"),
});

export const menuSchemaV2 = initialMenuSchema.merge(
  z.object({
    sectionGroups: z.array(sectionGroupSchemaV4),
  })
);

export type MenuV1 = z.infer<typeof initialMenuSchema>;
export type MenuV2 = Simplify<
  Merge<
    z.infer<typeof menuSchemaV2>,
    {
      sectionGroups: (SectionGroupV1 | SectionGroupV2 | SectionGroupV3)[];
    }
  >
>;

export type MenuV3 = Simplify<
  Merge<
    z.infer<typeof menuSchemaV3>,
    {
      sectionsGroups: (
        | SectionGroupV1
        | SectionGroupV2
        | SectionGroupV3
        | SectionGroupV4
      )[];
    }
  >
>;

export type MenuV4 = z.infer<typeof menuSchemaV4>;

export const menuSchemaV3 = menuSchemaV2.merge(
  z.object({
    subheaderFontFamily: z.string(),
    subheaderFontSize: z.number(),
  })
);

export const menuSchemaV4 = menuSchemaV3
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

export const menuMigrator = createZodMigrations({
  startingSchema: initialMenuSchema,
  endingSchema: menuSchemaV4,
})
  .addNestedArray({
    nestedMigrator: sectionGroupMigrator,
    path: "sectionGroups",
    schema: sectionGroupSchemaV4,
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

const safeSchema = menuMigrator.safeSchema();

type InferredMenuWithChildren = z.infer<typeof safeSchema>;
type CorrectMenuWithChildren = MenuV4 & {
  sectionGroups: SectionGroupWithChildren[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValidSchemaInference(): 1 {
  return 1 as Equals<InferredMenuWithChildren, CorrectMenuWithChildren>;
}

// Can I create an instance of the correct inferred type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const menu: InferredMenuWithChildren = {
  id: "",
  name: "",
  sectionHeaderFontFamily: "",
  sectionHeaderFontSize: 1,
  type: "MENU",
  sectionGroups: [
    {
      id: "",
      name: "",
      sectionHeaderFontFamily: "",
      sectionHeaderFontSize: 10,
      type: "SECTION_GROUP",
      sections: [
        {
          id: "",
          name: "",
          sectionHeaderFontFamily: "",
          sectionHeaderFontSize: 0,
          type: "SECTION",
          items: [
            {
              id: "",
              itemDescriptionFontFamily: "",
              itemDescriptionFontSize: 12,
              name: "",
              type: "ITEM",
            },
          ],
        },
      ],
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValid(): true {
  //   type InferredFromSchema = z.infer<typeof sectionSchemaV4>;
  //   type InferredFromMigrator = ZodMigratorEndShape<typeof sectionMigrator>;
  return true as IsZodMigratorValid<typeof sectionGroupMigrator>;
}
