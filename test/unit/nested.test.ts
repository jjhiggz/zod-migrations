import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { z } from "zod";
import {
  IsZodMigratorValid,
  mutators,
  ZodMigratorCurrentShape,
} from "../../src";
import { createZodMigrations } from "../../src/zod-migration";
import { Simplify } from "type-fest";

describe("mutator.up", () => {
  it("should migrate the nested schema in the up function", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });
    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    expect(mutator.up({ input: {} })).toEqual({
      nested: {
        name: "",
        age: 0,
      },
    });
  });

  it("should migrate safely according to nested schema", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: z.object({
        added: z.string(),
        firstName: z.string(),
        age: z.number(),
      }),
    })
      .add({
        path: "added",
        defaultVal: "",
        schema: z.string(),
      })
      .rename({
        source: "name",
        destination: "firstName",
      });

    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    expect(
      mutator.up({
        input: {
          nested: {
            name: "jon",
            age: 30,
          },
        },
      })
    ).toEqual({
      nested: {
        firstName: "jon",
        added: "",
        age: 30,
      },
    });
  });
});

describe("mutator.isValid", () => {
  it("IS NOT Valid if the nested value doesn't transform to something that can be parsed by the new schema", () => {
    const eventualSchema = z.object({
      firstName: z.string(),
      age: z.number(),
    });

    const nestedMigrator = createZodMigrations({
      endingSchema: eventualSchema,
      startingSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    }).rename({ source: "name", destination: "firstName" });

    const valid = mutators
      .addNestedPath({
        nestedMigrator,
        path: "nested",
        currentSchema: eventualSchema,
        defaultStartingVal: { name: "", age: 1 },
      })
      .isValid({
        input: {
          nested: { age: 1 },
        },
        paths: [],
        renames: [],
      });

    expect(valid).toBe(false);
  });
  it("IS Valid if the nested value transforms to something that can be parsed by the new schema", () => {
    const extendedSchema = testBasePersonSchema
      .omit({ name: true })
      .merge(z.object({ firstName: z.string() }));

    const nestedMigrator = createTestMigrator({
      endingSchema: extendedSchema,
    }).rename({
      source: "name",
      destination: "firstName",
    });

    const valid = mutators
      .addNestedPath({
        nestedMigrator,
        path: "nested",
        currentSchema: extendedSchema,
        defaultStartingVal: {},
      })
      .isValid({
        input: {
          nested: { name: "jon", age: 1 },
        },
        paths: [],
        renames: [],
      });

    expect(valid).toBe(true);
  });

  it("isvalid if the current schema on the nested migrator does parse", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    expect(
      mutator.isValid({
        input: {
          nested: {
            name: "",
            age: 0,
          },
        },
        paths: [],
        renames: [],
      })
    ).toEqual(true);
  });
});

describe("mutator.rewritePaths", () => {
  it("should add the nested path with the nested current schema to the paths", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });
    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    assertPathsEqual(mutator.rewritePaths([]), [
      { path: "nested", schema: testBasePersonSchema, nestedMigrator },
    ]);
  });
});

describe("mutator.rewriteRenames", () => {
  it("doesn't affect renames", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });
    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    expect(mutator.rewriteRenames({ renames: [["dumb", "silly"]] })).toEqual([
      ["dumb", "silly"],
    ]);
  });
});

describe("mutator.beforeMutate", () => {
  it("explodes if trying to add a nested path over an existing path", async () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });
    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    const result = await Promise.resolve()
      .then(() => {
        mutator.beforeMutate({
          paths: [
            { path: "nested", schema: testBasePersonSchema, nestedMigrator },
          ],
        });
      })
      .catch((e) => e);

    expect(result).toBeInstanceOf(Error);
  });

  it("doesn't explode if not overriding a valid path", async () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });
    const mutator = mutators.addNestedPath({
      currentSchema: testBasePersonSchema,
      defaultStartingVal: {},
      nestedMigrator,
      path: "nested",
    });

    const result = await Promise.resolve()
      .then(() => {
        mutator.beforeMutate({
          paths: [
            { path: "a", schema: z.string() },
            { path: "b", schema: z.string() },
            { path: "c", schema: z.string() },
          ],
        });
      })
      .then(() => "success")
      .catch((e) => e);

    expect(result).toBe("success");
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

describe.skip("Type Tests", () => {
  const currentSchema = testBasePersonSchema.extend({
    nested: testBasePersonSchema,
  });

  const nestedMigrator = createZodMigrations({
    startingSchema: testBasePersonSchema,
    endingSchema: testBasePersonSchema,
  });

  const migrator = createZodMigrations({
    startingSchema: testBasePersonSchema,
    endingSchema: currentSchema,
  }).addNested({
    path: "nested",
    currentSchema: testBasePersonSchema,
    defaultStartingVal: {
      age: 0,
      name: "",
    },
    nestedMigrator,
  });

  function isValid(): true {
    return true as IsZodMigratorValid<typeof migrator>;
  }
});
