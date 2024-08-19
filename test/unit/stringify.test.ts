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

  it("should parse nested objects into the newest form", () => {
    const doubleNestedSchema = testBasePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
        plant: z.string(),
      })
    );

    const nestedSchema = testBasePersonSchema.merge(
      z.object({
        doubleNested: doubleNestedSchema,
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

    const nestedEvolver = createTestMigrator({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultStartingVal: {},
      nestedMigrator: doubleNested,
      currentSchema: doubleNestedSchema,
    });

    const schema = testBasePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createTestMigrator({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: nestedSchema,
    });

    const baseTransform = evolver.transform({
      name: "jon",
      age: 10,
      nested: {
        name: "jim",
        age: 20,
        doubleNested: {
          cheese: "cheddar",
          firstName: "jordan",
          age: 30,
        },
      },
    });

    const baseTransformWithInvalidSchema = evolver.transform({
      name: "jon",
      age: 10,
      nested: {
        name: "jim",
        age: 20,
        doubleNested: {
          name: "jordan",
          age: 30,
        },
      },
    });

    expect(baseTransformWithInvalidSchema).toEqual({
      name: "jon",
      age: 10,
      nested: {
        name: "jim",
        age: 20,
        doubleNested: {
          firstName: "jordan",
          age: 30,
          cheese: "swiss",
          plant: "tomato",
        },
      },
    });

    expect(baseTransform).toEqual({
      name: "jon",
      age: 10,
      nested: {
        name: "jim",
        age: 20,
        doubleNested: {
          firstName: "jordan",
          age: 30,
          cheese: "cheddar",
          plant: "tomato",
        },
      },
    });
  });

  it("should parse deeply nested objects into the newest form", () => {
    const doubleNestedSchema = testBasePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
        plant: z.string(),
      })
    );

    const nestedSchema = testBasePersonSchema.merge(
      z.object({
        doubleNested: doubleNestedSchema,
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

    const nestedEvolver = createTestMigrator({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultStartingVal: {},
      nestedMigrator: doubleNested,
      currentSchema: doubleNestedSchema,
    });

    const schema = testBasePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createTestMigrator({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: nestedSchema,
    });

    const baseTransform = evolver.transform({
      name: "jon",
      age: 10,
      nested: {
        name: "jim",
        age: 20,
        doubleNested: {
          cheese: "cheddar",
          name: "jordan",
          age: 30,
        },
      },
    });

    expect(baseTransform).toEqual({
      name: "jon",
      age: 10,
      nested: {
        name: "jim",
        age: 20,
        doubleNested: {
          firstName: "jordan",
          age: 30,
          cheese: "swiss",
          plant: "tomato",
        },
      },
    });
  });

  it("should correctly transform double nested objects with changes", () => {
    const doubleNestedSchema = testBasePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
      })
    );

    const nestedSchema = testBasePersonSchema.merge(
      z.object({
        doubleNested: doubleNestedSchema,
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
      });

    const nestedEvolver = createTestMigrator({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultStartingVal: {},
      nestedMigrator: doubleNested,
      currentSchema: doubleNestedSchema,
    });

    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
        z.object({
          nested: nestedSchema,
        })
      ),
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: nestedSchema,
    });

    const baseTransform = evolver.transform({});

    expect(baseTransform).toEqual({
      name: "",
      age: 0,
      nested: {
        name: "",
        age: 0,
        doubleNested: {
          firstName: "",
          age: 0,
          cheese: "swiss",
        },
      },
    });
  });

  it("should stringify double nested objects", () => {
    const doubleNested = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const nestedSchema = testBasePersonSchema.merge(
      z.object({
        doubleNested: testBasePersonSchema,
      })
    );

    const nestedEvolver = createTestMigrator({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultStartingVal: {},
      nestedMigrator: doubleNested,
      currentSchema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
        z.object({
          nested: nestedSchema,
        })
      ),
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
        doubleNested: z.object({
          name: z.string(),
          age: z.number(),
        }),
      }),
    });

    const baseTransform = evolver.transform({});

    const stringifyResult = JSON.parse(evolver.stringify(baseTransform));
    expect(stringifyResult).toBeDefined();
  });

  it("should strip properties from double nested objects", () => {
    const doubleSchema = testBasePersonSchema;
    const nestedSchema = testBasePersonSchema.merge(
      z.object({
        doubleNested: doubleSchema,
      })
    );

    const schema = testBasePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const doubleNested = createTestMigrator({ endingSchema: doubleSchema });

    const nestedEvolver = createTestMigrator({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultStartingVal: {},
      nestedMigrator: doubleNested,
      currentSchema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createTestMigrator({
      endingSchema: schema,
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: nestedSchema,
    });

    const baseTransform = evolver.transform({});

    const stringifyResult = JSON.parse(evolver.stringify(baseTransform));

    const transformed = evolver.transform(stringifyResult);

    expect(transformed).not.toHaveProperty(schemaEvolutionCountTag);
    expect(transformed["nested"]).not.toHaveProperty(schemaEvolutionCountTag);
  });

  it("should strip properties from nested objects", () => {
    const nestedSchema = testBasePersonSchema;
    const schema = testBasePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );
    const nestedEvolver = createTestMigrator({ endingSchema: nestedSchema });

    const evolver = createTestMigrator({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const stringifyResult = JSON.parse(
      evolver.stringify(evolver.transform({}))
    );

    const transformed = evolver.transform(stringifyResult);

    expect(transformed).not.toHaveProperty(schemaEvolutionCountTag);
    expect(transformed["nested"]).not.toHaveProperty(schemaEvolutionCountTag);
  });

  it("should tag a nested object with correct version", () => {
    const nestedSchema = testBasePersonSchema;
    const nestedEvolver = createTestMigrator({ endingSchema: nestedSchema });
    const schema = testBasePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createTestMigrator({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultStartingVal: {},
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const stringifyResult = evolver.stringify(evolver.transform({}));
    expect(JSON.parse(stringifyResult)["nested"][schemaEvolutionCountTag]).toBe(
      2
    );
  });

  it("should not strip nested props when strip set to false", () => {
    const nestedSchema = testBasePersonSchema;
    const nestedEvolver = createTestMigrator({ endingSchema: nestedSchema });
    testBasePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createTestMigrator({
      endingSchema: nestedSchema,
    }).addNested({
      nestedMigrator: nestedEvolver,
      path: "nested",
      currentSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
      defaultStartingVal: {},
    });

    const stringifyResult = evolver.stringify(
      evolver.transform({}, { strip: false })
    );

    expect(JSON.parse(stringifyResult)["nested"][schemaEvolutionCountTag]).toBe(
      2
    );
  });
});
