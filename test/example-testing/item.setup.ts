import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";
import { IsZodMigratorValid } from "../../src/types/types";

export const initialItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("ITEM"),
});

export type ItemV1 = z.infer<typeof initialItemSchema>;
export type ItemV2 = z.infer<typeof itemV2Schema>;
export type ItemV3 = z.infer<typeof itemV3Schema>;

export const itemV2Schema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("ITEM"),
  paragraphFontFamily: z.string(),
  paragraphFontSize: z.number(),
});

export const itemV3Schema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("ITEM"),
  itemDescriptionFontFamily: z.string(),
  itemDescriptionFontSize: z.number(),
});

export const itemMigratorToV3 = createZodMigrations({
  startingSchema: initialItemSchema,
  endingSchema: itemV3Schema,
})
  .addMany({
    defaultValues: {
      paragraphFontFamily: "Default Font",
      paragraphFontSize: 12,
    },
    schema: z.object({
      paragraphFontFamily: z.string(),
      paragraphFontSize: z.number(),
    }),
  })
  .renameMany({
    paragraphFontFamily: "itemDescriptionFontFamily",
    paragraphFontSize: "itemDescriptionFontSize",
  } as const);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValid(): true {
  return true as IsZodMigratorValid<typeof itemMigratorToV3>;
}
