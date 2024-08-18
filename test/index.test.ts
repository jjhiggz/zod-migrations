/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import {
  createZodMigrations,
  ZodMigrations,
  testAllVersions,
  schemaEvolutionCountTag,
  versionTag,
} from "../src/zod-migration";
import { string, z, ZodSchema } from "zod";
import type { Equals } from "../src/types/Equals";
import { getValidRenames, mutators } from "../src/mutators";
import { GetJsonEvolverShape } from "../src/types/types";

const basePersonSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const createEvolver = <EndingSchema extends ZodSchema<any, any>>({
  endingSchema,
}: {
  endingSchema: EndingSchema;
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

describe("getValidRenames", () => {
  it("should find one valid rename", () => {
    expect(getValidRenames([["name", "firstName"]], "name")).toEqual([
      "name",
      "firstName",
    ]);
  });

  it("should work if I rename twice", () => {
    expect(
      getValidRenames(
        [
          ["name", "firstName"],
          ["firstName", "name"],
        ],
        "name"
      )
    ).toEqual(["name", "firstName"]);
  });

  it("should work with multiple renames", () => {
    expect(
      getValidRenames(
        [
          ["name", "name2"],
          ["name2", "name3"],
        ],
        "name"
      )
    ).toEqual(["name", "name2", "name3"]);
  });
});

describe("validation rules", () => {
  it("should account for renames ", () => {
    const doubleNestedSchema = basePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
        plant: z.string(),
      })
    );
    const doubleNested = createEvolver({
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

describe("addNested", () => {
  it("should work as expected", () => {
    const nested = createEvolver({
      endingSchema: z.object({ name: z.string() }),
    });

    const evolver = createEvolver({ endingSchema: basePersonSchema }).addNested(
      {
        nestedMigrator: nested,
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
        defaultVal: {
          age: 0,
          name: "",
        },
        path: "nested",
      }
    );

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
      nested: {
        name: "",
        age: 0,
      },
    });
  });
});

describe("add", () => {
  it("should poop out all of the defaults if empty object put in", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });

  it("should corectly apply defaults", () => {
    const evolver = new ZodMigrations()
      .add({
        path: "name",
        defaultVal: "jon",
        schema: z.string(),
      })
      .add({
        path: "age",
        defaultVal: 10,
        schema: z.number(),
      });

    expect(evolver.transform({})).toEqual({
      name: "jon",
      age: 10,
    });
  });

  it("should throw an error for name conflict", async () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema }).add({
      defaultVal: "",
      path: "random",
      schema: z.string(),
    });

    const result = await Promise.resolve()
      .then(() =>
        evolver.add({ path: "random", defaultVal: "any", schema: z.string() })
      )
      .catch((e) => {
        expect(e.message).toBe("'random' already exists in your JsonEvolver");
        return null;
      });
    expect(result).toBe(null);
  });
});

describe("rename", () => {
  it("should poop out the correct type", () => {
    const evolverBefore = createEvolver({
      endingSchema: basePersonSchema.omit({ name: true }).merge(
        z.object({
          firstName: z.string(),
        })
      ),
    });

    const evolver = evolverBefore.rename({
      source: "name",
      destination: "firstName",
    });

    expect(evolver.transform({}).firstName).toEqual("");
    expect(evolver.transform({ name: "jon" }).firstName).toEqual("jon");
  });

  it("should throw an error for name conflict", async () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({
          random: z.string(),
          random2: z.string(),
        })
      ),
    })
      .add({
        path: "random",
        schema: z.string(),
        defaultVal: "",
      })
      .add({
        path: "random2",
        schema: z.string(),
        defaultVal: "",
      });

    const source = "random2";
    const destination = "random";

    const result = await Promise.resolve()
      .then(() => {
        return evolver.rename({
          source: "random2",
          destination: "random",
        });
      })
      .catch((e) => {
        expect(e.message).toBe(
          `Cannot rename '${source}' to  '${destination}' because it already exists in your schema`
        );
        return null;
      });

    expect(result).toBe(null);
    /*  */
  });

  it("should not explode when a valid previous version is put in", async () => {
    const initialPersonSchema = z.object({
      name: z.string(),
    });

    const currentPersonSchema = z.object({
      firstName: z.string(),
      lastName: z.string(),
    });

    const personEvolver = createZodMigrations({
      startingSchema: initialPersonSchema,
      endingSchema: currentPersonSchema,
    })
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "lastName",
        schema: z.string(),
        defaultVal: "",
      })
      .safeSchema();

    const result = await personEvolver
      .parseAsync({ firstName: "jon" })
      .catch((e) => {
        console.error(e);
        return null;
      });

    expect(result).toEqual({ firstName: "jon", lastName: "" });
  });
});

describe("stringify", () => {
  it("should tag an unnested object", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });

    const stringifyResult = evolver.stringify(evolver.transform({}));
    expect(JSON.parse(stringifyResult)).toHaveProperty(schemaEvolutionCountTag);
  });

  it("should correctly transform double nested objects", () => {
    const doubleNested = createEvolver({ endingSchema: basePersonSchema });

    const nestedEvolver = createEvolver({
      endingSchema: basePersonSchema,
    }).addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver({ endingSchema: basePersonSchema }).addNested(
      {
        path: "nested",
        nestedMigrator: nestedEvolver,
        defaultVal: {
          age: 0,
          name: "",
        },
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      }
    );

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
    const doubleNestedSchema = basePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
        plant: z.string(),
      })
    );

    const nestedSchema = basePersonSchema.merge(
      z.object({
        doubleNested: doubleNestedSchema,
      })
    );

    const doubleNested = createEvolver({
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

    const nestedEvolver = createEvolver({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const schema = basePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createEvolver({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 0,
        name: "",
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
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
    const doubleNestedSchema = basePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
        plant: z.string(),
      })
    );

    const nestedSchema = basePersonSchema.merge(
      z.object({
        doubleNested: doubleNestedSchema,
      })
    );

    const doubleNested = createEvolver({
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

    const nestedEvolver = createEvolver({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const schema = basePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createEvolver({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 0,
        name: "",
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
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
    const doubleNestedSchema = basePersonSchema.omit({ name: true }).merge(
      z.object({
        firstName: z.string(),
        cheese: z.string(),
      })
    );

    const nestedSchema = basePersonSchema.merge(
      z.object({
        doubleNested: doubleNestedSchema,
      })
    );

    const doubleNested = createEvolver({
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

    const nestedEvolver = createEvolver({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({
          nested: nestedSchema,
        })
      ),
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 0,
        name: "",
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
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
          firstName: "",
          age: 0,
          cheese: "swiss",
        },
      },
    });
  });

  it("should stringify double nested objects", () => {
    const doubleNested = createEvolver({ endingSchema: basePersonSchema });

    const nestedSchema = basePersonSchema.merge(
      z.object({
        doubleNested: basePersonSchema,
      })
    );

    const nestedEvolver = createEvolver({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({
          nested: nestedSchema,
        })
      ),
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 0,
        name: "",
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const baseTransform = evolver.transform({});

    const stringifyResult = JSON.parse(evolver.stringify(baseTransform));
    expect(stringifyResult).toBeDefined();
  });

  it("should strip properties from double nested objects", () => {
    const doubleSchema = basePersonSchema;
    const nestedSchema = basePersonSchema.merge(
      z.object({
        doubleNested: doubleSchema,
      })
    );

    const schema = basePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const doubleNested = createEvolver({ endingSchema: doubleSchema });

    const nestedEvolver = createEvolver({
      endingSchema: nestedSchema,
    }).addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver({
      endingSchema: schema,
    }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 0,
        name: "",
      },
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const baseTransform = evolver.transform({});

    const stringifyResult = JSON.parse(evolver.stringify(baseTransform));

    // const transformed = evolver.transform(stringifyResult);

    // expect(transformed).not.toHaveProperty(schemaEvolutionCountTag);
    // expect(transformed["nested"]).not.toHaveProperty(schemaEvolutionCountTag);
  });

  it("should strip properties from nested objects", () => {
    const nestedSchema = basePersonSchema;
    const schema = basePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );
    const nestedEvolver = createEvolver({ endingSchema: nestedSchema });

    const evolver = createEvolver({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 1,
        name: "",
      },
      schema: z.object({
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
    const nestedSchema = basePersonSchema;
    const nestedEvolver = createEvolver({ endingSchema: nestedSchema });
    const schema = basePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createEvolver({ endingSchema: schema }).addNested({
      path: "nested",
      nestedMigrator: nestedEvolver,
      defaultVal: {
        age: 1,
        name: "",
      },
      schema: z.object({
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
    const nestedSchema = basePersonSchema;
    const nestedEvolver = createEvolver({ endingSchema: nestedSchema });
    const schema = basePersonSchema.merge(
      z.object({
        nested: nestedSchema,
      })
    );

    const evolver = createEvolver({ endingSchema: nestedSchema }).addNested({
      nestedMigrator: nestedEvolver,
      path: "nested",
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
      defaultVal: {
        age: 0,
        name: "",
      },
    });

    const stringifyResult = evolver.stringify(
      evolver.transform({}, { strip: false })
    );

    expect(JSON.parse(stringifyResult)["nested"][schemaEvolutionCountTag]).toBe(
      2
    );
  });
});

describe("remove", () => {
  it("should poop out the right thing", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema.omit({ age: true }),
    }).remove("age");

    expect(evolver.transform({})).toEqual({ name: "" });
    expect(evolver.transform({ name: "Jon" })).toEqual({ name: "Jon" });

    // Type Test
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (): { name: string } => evolver.transform({});
  });
});

describe("transform", () => {
  it("should strip types at default", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const transformed = evolver.transform(result);
    expect(transformed).not.toHaveProperty(schemaEvolutionCountTag);
    expect(transformed).not.toHaveProperty(versionTag);
  });

  it("should allow props through if not stripped", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const transformed = evolver.transform(result, { strip: false });
    expect(transformed).toHaveProperty(schemaEvolutionCountTag);
  });

  it("should apply no transforms when unchanged", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    evolver.transform(result);

    expect(evolver.__get_private_data().transformsAppliedCount).toBe(0);
  });

  it("should apply remaining transforms when changed", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const evolver2 = evolver
      .add({
        path: "motto",
        defaultVal: "",
        schema: z.string(),
      })
      .rename({
        source: "name",
        destination: "first-name",
      });

    evolver2.transform(result);

    expect(evolver2.__get_private_data().transformsAppliedCount).toBe(2);
  });

  it("should only apply necessary transforms", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema });
    evolver.transform({ name: "jon" });
    expect(evolver.__get_private_data().transformsAppliedCount).toBe(1);
  });

  it("should appropriately tag the schema when starting with schema", () => {
    const startingSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const evolver = createZodMigrations({
      startingSchema,
      endingSchema: startingSchema,
    });

    const stringified = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    expect(stringified[schemaEvolutionCountTag]).toBe(0);

    const evolver2 = evolver.add({
      path: "lastName",
      defaultVal: "",
      schema: z.string(),
    });

    const stringified2 = JSON.parse(
      evolver2.stringify({ name: "jon", age: 30 })
    );

    expect(stringified2[schemaEvolutionCountTag]).toBe(1);
  });

  it("should apply relevant transforms only when starting from a schema", () => {
    const evolver = createZodMigrations({
      startingSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
    });

    const stringified = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const evolver2 = evolver
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "lastName",
        defaultVal: "",
        schema: z.string(),
      });

    evolver2.transform(stringified);

    expect(evolver2.__get_private_data().transformsAppliedCount).toBe(2);
  });
});

describe("mutate", () => {
  it("should work just like add with add mutator", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({
          cheese: z.string(),
        })
      ),
    }).mutate(() =>
      mutators.add({
        defaultVal: "swiss",
        path: "cheese",
        schema: z.string(),
      })
    );

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
      cheese: "swiss",
    });
  });

  it("should work with removeOne", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema,
    })
      .add({
        defaultVal: "",
        path: "cheese",
        schema: z.string(),
      })
      .mutate(() => mutators.removeOne("cheese"));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });

  it("should work with removeMany", () => {
    const evolver = createEvolver({ endingSchema: basePersonSchema })
      .add({
        defaultVal: "",
        path: "cheese",
        schema: z.string(),
      })
      .add({
        defaultVal: "",
        path: "pizza",
        schema: z.string(),
      })
      .mutate(() => mutators.removeMany(["cheese", "pizza"]));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });

  it("should work with rename", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({
          pizza: z.string(),
        })
      ),
    })
      .add({
        defaultVal: "",
        path: "cheese",
        schema: z.string(),
      })
      .mutate(() => mutators.rename("cheese", "pizza"));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
      pizza: "",
    });
  });
});

describe("check all versions", () => {
  it("should test all versions", () => {
    testAllVersions({
      evolver: createEvolver({
        endingSchema: basePersonSchema
          .omit({ name: true })
          .merge(z.object({ firstName: z.string() })),
      })
        .rename({
          source: "name",
          destination: "firstName",
        })
        .rename({
          source: "firstName",
          destination: "name",
        })
        .rename({
          source: "name",
          destination: "firstName",
        }),
      schema: z.object({ firstName: z.string(), age: z.number() }),
      expect: expect,
      startData: {},
      customTestCase: [
        { input: { name: "jon" }, output: { firstName: "jon", age: 0 } },
      ],
    });
  });
});

describe("addMany", () => {
  it("should work with builtin method", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({
          cheese: z.string(),
          poop: z.string(),
        })
      ),
    }).addMany({
      schema: z.object({
        cheese: z.string(),
        poop: z.string(),
      }),
      defaultValues: {
        cheese: "",
        poop: "",
      },
    });

    evolver.__clone().remove("name"); // type should not fail
    evolver.__clone().remove("poop"); // type should not fail otherwise addMany inferring wrong type

    testAllVersions({
      evolver,
      expect,
      schema: z.object({
        name: z.string(),
        cheese: z.string(),
        age: z.number(),
        poop: z.string(),
      }),
      startData: {},
      customTestCase: [
        {
          input: { name: "jon", age: 12 },
          output: {
            name: "jon",
            age: 12,
            poop: "",
            cheese: "",
          },
        },
      ],
    });
  });

  it("should work with merge", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema.merge(
        z.object({ cheese: z.string(), poop: z.string() })
      ),
    }).mutate(() =>
      mutators.addMany({
        defaultValues: {
          cheese: "",
          poop: "",
        },
        schema: z.object({
          cheese: z.string(),
          poop: z.string(),
        }),
      })
    );

    function correctEvolverShape(): 1 {
      return 1 as Equals<
        GetJsonEvolverShape<typeof evolver>,
        { name: string; age: number; cheese: string; poop: string }
      >;
    }

    testAllVersions({
      evolver,
      expect,
      schema: z.object({
        name: z.string(),
        cheese: z.string(),
        age: z.number(),
        poop: z.string(),
      }),
      startData: {},
      customTestCase: [
        {
          input: { name: "jon", age: 12 },
          output: {
            name: "jon",
            age: 12,
            poop: "",
            cheese: "",
          },
        },
      ],
    });
  });
});

describe("renameMany", () => {
  it("should work for builtin rename many", () => {
    const renames = {
      age: "newAge",
      name: "newName",
    } as const;

    const evolver = createEvolver({
      endingSchema: basePersonSchema
        .merge(
          z.object({
            dummy: z.string(),
          })
        )
        .omit({
          age: true,
          name: true,
        })
        .merge(
          z.object({
            newAge: z.number(),
            newName: z.string(),
          })
        ),
    })
      .add({
        path: "dummy",
        defaultVal: "",
        schema: z.string(),
      })
      .renameMany({
        age: "newAge",
        name: "newName",
      } as const);

    function correctEvolverShape(): 1 {
      return 1 as Equals<
        GetJsonEvolverShape<typeof evolver>,
        { newName: string; newAge: number; dummy: string }
      >;
    }

    testAllVersions({
      evolver,
      expect,
      schema: z.object({
        newName: z.string(),
        newAge: z.number(),
        dummy: z.string(),
      }),
      startData: {},
      customTestCase: [
        {
          input: { name: "jon", age: 12, dummy: "" },
          output: {
            newName: "jon",
            newAge: 12,
            dummy: "",
          },
        },
      ],
    });
  });
  it("should work for rename many", () => {
    const evolver = createEvolver({
      endingSchema: basePersonSchema
        .merge(z.object({ dummy: z.string() }))
        .omit({ name: true, age: true })
        .merge(
          z.object({
            newAge: z.number(),
            newName: z.string(),
          })
        ),
    })
      .add({
        path: "dummy",
        defaultVal: "",
        schema: z.string(),
      })
      .mutate((shape) => {
        const renames: Partial<Record<keyof typeof shape, string>> = {
          age: "newAge",
          name: "newName",
        };

        return mutators.renameMany<typeof shape, typeof renames>({
          renames,
        });
      });

    testAllVersions({
      evolver,
      expect,
      schema: z.object({
        newName: z.string(),
        newAge: z.number(),
        dummy: z.string(),
      }),
      startData: {},
      customTestCase: [
        {
          input: { name: "jon", age: 12, dummy: "" },
          output: {
            newName: "jon",
            newAge: 12,
            dummy: "",
          },
        },
      ],
    });
  });
});

function testSafeSchemaReturnType(): 1 {
  const restaurantSchema = z.object({
    name: z.string(),
  });

  const menuSchema = z.object({
    menuName: z.string(),
  });

  const restaurantWithChildren = restaurantSchema.extend({
    menus: z.array(menuSchema),
  });

  const evolver = createZodMigrations({
    startingSchema: restaurantSchema,
  }).addNested({
    path: "menus",
    schema: z.array(menuSchema),
    defaultVal: [],
    nestedMigrator: createZodMigrations({
      startingSchema: menuSchema,
      endingSchema: restaurantWithChildren,
    }),
  });

  const safeSchema: typeof restaurantWithChildren = evolver.safeSchema();

  type A = z.infer<typeof restaurantWithChildren>;
  type B = z.infer<typeof safeSchema>;

  const badEvolver = evolver.remove("name");

  // should be type never if evolver is missing fields in schema
  const badEvolverSchema = badEvolver.safeSchema();
  // @ts-expect-error badEvolver schema should never be equal
  const a: Equals<
    z.infer<typeof badEvolverSchema>,
    z.infer<typeof restaurantWithChildren>
  > = 1;

  // should explode if schema is missing fields in evolver
  const otherBadEvolverSchema = badEvolver
    .add({
      path: "cheese",
      defaultVal: "",
      schema: z.string(),
    })
    // @ts-expect-error if schema fields missing
    .safeSchema(restaurantWithChildren);

  // should
  type C = z.infer<typeof restaurantWithChildren>;
  type D = z.infer<typeof safeSchema>;

  const canInstantiateNested: D = {
    name: "restaurant",
    menus: [
      {
        menuName: "menu 1",
      },
    ],
  };

  return 1 as Equals<A, B>;
}
