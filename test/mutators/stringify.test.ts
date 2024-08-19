import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { schemaEvolutionCountTag } from "../../src";
import { z } from "zod";

describe("stringify", () => {
  it("should tag an unnested object", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });

    const stringifyResult = evolver.stringify(evolver.transform({}));
    expect(JSON.parse(stringifyResult)).toHaveProperty(schemaEvolutionCountTag);
  });

  it("should correctly transform double nested objects", () => {
    const doubleNested = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const nestedEvolver = createTestMigrator({
      endingSchema: testBasePersonSchema,
    }).addNested({
      path: "doubleNested",
      defaultStartingVal: {},
      nestedMigrator: doubleNested,
      currentSchema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema,
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
        doubleNested: testBasePersonSchema,
      }),
    });

    const baseTransform = evolver.transform({});

    expect(baseTransform).toEqual({
      name: "",
      age: 0,
      nested: {
        name: "",
        age: 0,
        doubleNested: {
          name: "",
          age: 0,
        },
      },
    });
  });
});
