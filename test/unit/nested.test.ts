import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { z } from "zod";
import { mutators } from "../../src";

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
  it("isn't valid if the current schema on the nested migrator does not parse", () => {
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
            age: "", // should be a number
          },
        },
        paths: [],
        renames: [],
      })
    ).toEqual(false);
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
