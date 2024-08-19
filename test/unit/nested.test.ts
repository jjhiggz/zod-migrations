import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { z } from "zod";

describe("isValid", () => {
  it("todo", () => {
    expect(true).toBe(true);
  });
});

describe("full transform tests", () => {
  it("base case should appropriately define defaults", () => {
    const nested = createTestMigrator({
      endingSchema: z.object({ name: z.string() }),
    });

    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema,
    }).addNested({
      nestedMigrator: nested,
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
      defaultStartingVal: {},
      path: "nested",
    });

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
      nested: {
        name: "",
        age: 0,
      },
    });
  });

  it("renamed values should carry through", () => {
    const doubleNestedSchema = testBasePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
        plant: z.string(),
      })
    );
    const doubleNested = createTestMigrator({
      endingSchema: doubleNestedSchema,
    })
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "cheese",
        defaultVal: "swiss",
        schema: z.string(),
      })
      .add({
        path: "plant",
        defaultVal: "tomato",
        schema: z.string(),
      });

    expect(
      doubleNested.transform({
        age: 10,
        firstName: "jordan",
        cheese: "cheddar",
      })
    ).toEqual({
      age: 10,
      firstName: "jordan",
      plant: "tomato",
      cheese: "cheddar",
    });
  });
});
