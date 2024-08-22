import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { mutators, schemaEvolutionCountTag } from "../../src";
import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";

const dummyNestedMigrator = createZodMigrations({
  endingSchema: z.object({
    name: z.string(),
    age: z.number(),
  }),
  startingSchema: z.object({}),
}).addMany({
  defaultValues: {
    age: 0,
    name: "",
  },
  schema: z.object({
    name: z.string(),
    age: z.number(),
  }),
});

const dummyMutator = mutators.addNestedArray({
  currentSchema: z.object({
    name: z.string(),
    age: z.number(),
  }),
  nestedMigrator: dummyNestedMigrator,
  path: "nested",
});

describe("mutator.up", () => {
  it("should work base case", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const transformed = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .up({
        input: {
          nested: [{}],
        },
      });

    expect(transformed).toEqual({
      nested: [
        {
          name: "",
          age: 0,
        },
      ],
    });
  });
});

describe("mutator.isValid", () => {
  it("isValid should succeed if value found at path is valid according to current value", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const valid = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .isValid({
        input: {
          nested: [],
        },
        paths: [],
        renames: [],
      });

    expect(valid).toBe(true);
  });

  it("isValid should succeed if nested path TRANSFORMS to correct value", () => {
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
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: extendedSchema,
      })
      .isValid({
        input: {
          nested: [{ name: "jon", age: 1 }],
        },
        paths: [],
        renames: [],
      });

    expect(valid).toBe(true);
  });

  it("isValid should fail if path isn't there", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const valid = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .isValid({
        input: {},
        paths: [],
        renames: [],
      });

    expect(valid).toBe(false);
  });

  it("isValid should succeed if renamed path is there", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const valid = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .isValid({
        input: {
          "nested-sibling": [],
        },
        paths: [],
        renames: [["nested", "nested-sibling"]],
      });

    expect(valid).toBe(true);
  });
});

describe("mutator.rewritePaths", () => {
  it("should add the path to the array", () => {
    const result = mutators.addNestedArray({
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
      nestedMigrator: dummyNestedMigrator,
      path: "nested",
    });

    assertPathsEqual(
      result.rewritePaths([
        { path: "name", schema: z.string() },
        { path: "age", schema: z.number() },
      ]),
      [
        { path: "name", schema: z.string() },
        { path: "age", schema: z.number() },
        {
          path: "nested",
          schema: z.object({
            name: z.string(),
            age: z.number(),
          }),
        },
      ]
    );
  });
});

describe("mutator.rewriteRenames", () => {
  it("shouldn't rewrite renames", () => {
    const result = mutators
      .addNestedArray({
        currentSchema: z.object({
          name: z.string(),
          age: z.number(),
        }),
        nestedMigrator: dummyNestedMigrator,
        path: "nested",
      })
      .rewriteRenames({
        renames: [],
      });
    expect(result).toEqual([]);
  });
});

describe("beforeMutate", () => {
  it("should throw an error for name conflict", async () => {
    const result = await Promise.resolve()
      .then(() => {
        dummyMutator.beforeMutate({
          paths: [
            {
              path: "name",
              nestedMigrator: dummyNestedMigrator,
              schema: z.string(),
            },
            {
              path: "age",
              nestedMigrator: dummyNestedMigrator,
              schema: z.number(),
            },
            {
              path: "nested",
              nestedMigrator: dummyNestedMigrator,
              schema: z.object({ name: z.string(), age: z.number() }),
            },
          ],
        });
      })
      .catch((e) => e);

    expect(result).toBeInstanceOf(Error);
  });
});

describe("stringified", () => {
  it("should tag stringified data correctly", () => {
    const nestedSchema = testBasePersonSchema
      .omit({
        name: true,
      })
      .merge(
        z.object({
          firstName: z.string(),
        })
      );

    const nestedMigrator = createTestMigrator({
      endingSchema: nestedSchema,
    }).rename({
      source: "name",
      destination: "firstName",
    });

    const migrator = createZodMigrations({
      endingSchema: z.object({
        nested: nestedSchema,
      }),
      startingSchema: z.object({}),
    }).addNestedArray({
      nestedMigrator,
      path: "nested",
      schema: nestedSchema,
    });

    const stringified = migrator.preStringify({
      nested: [
        {
          firstName: "jon",
          age: 0,
        },
      ],
    });

    expect(stringified).toEqual({
      [schemaEvolutionCountTag]: 1,
      nested: [{ age: 0, firstName: "jon", [schemaEvolutionCountTag]: 3 }],
    });
  });
});

describe("full transform tests", () => {
  it("should evolve nested schemas and retain information", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema
        .omit({
          name: true,
        })
        .merge(
          z.object({
            firstName: z.string(),
          })
        ),
    }).rename({
      source: "name",
      destination: "firstName",
    });

    const transformed = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .up({
        input: {
          nested: [
            {
              name: "jon",
            },
          ],
        },
      });

    expect(transformed).toEqual({
      nested: [
        {
          firstName: "jon",
          age: 0,
        },
      ],
    });
  });
});
