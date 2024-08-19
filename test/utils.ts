import { z } from "zod";
import { createZodMigrations, ZShape } from "../src/zod-migration";

export const testBasePersonSchema = z.object({
  name: z.string(),
  age: z.number(),
});

export const createTestMigrator = <Shape extends object>({
  endingSchema,
}: {
  endingSchema: ZShape<Shape>;
}) =>
  createZodMigrations({
    startingSchema: z.object({}),
    endingSchema: endingSchema,
  })
    .add({
      defaultVal: "",
      path: "name",
      schema: z.string(),
    })
    .add({
      path: "age",
      defaultVal: 0,
      schema: z.number(),
    });
