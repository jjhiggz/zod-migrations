import { z } from "zod";
import { createZodMigrations } from "../src/zod-migration";
import { FillableObject, PathData, ZShape } from "../src/types/types";
import { expect } from "vitest";

export const testBasePersonSchema = z.object({
  name: z.string(),
  age: z.number(),
});

export const createTestMigrator = <Shape extends FillableObject>({
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

export const assertPathsEqual = (compare: PathData[], to: PathData[]) => {
  for (let i = 0; i < Math.max(compare.length, to.length); i++) {
    const compareVal = compare[i];
    const toVal = to[i];
    expect(compareVal.path).toBe(toVal.path);
    expect(compareVal.schema._type).toEqual(toVal.schema._type);
  }
};
