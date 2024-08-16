/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import {
  createZodMigrations,
  ZodMigrations,
  testAllVersions,
  schemaEvolutionCountTag,
  versionTag,
} from "../src/zod-migration";
import { string, z } from "zod";
import type { Equals } from "../src/types/Equals";
import { mutators } from "../src/mutators";
import { GetJsonEvolverShape } from "../src/types/types";

const createEvolver = () =>
  new ZodMigrations()
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

describe("addNested", () => {
  it("should work as expected", () => {
    const nested = createEvolver();

    const evolver = createEvolver().addNested({
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
});

describe("add", () => {
  it("should poop out all of the defaults if empty object put in", () => {
    const evolver = createEvolver();

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
    const evolver = createEvolver().add({
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
    const evolverBefore = createEvolver();

    const evolver = evolverBefore.rename({
      source: "name",
      destination: "firstName",
    });

    expect(evolver.transform({}).firstName).toEqual("");
    expect(evolver.transform({ name: "jon" }).firstName).toEqual("jon");
  });
  it("should throw an error for name conflict", async () => {
    const evolver = createEvolver()
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

    const personEvolver = createZodMigrations({ schema: initialPersonSchema })
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "lastName",
        schema: z.string(),
        defaultVal: "",
      })
      .safeSchema(currentPersonSchema);

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
    const evolver = createEvolver();

    const stringifyResult = evolver.stringify(evolver.transform({}));
    expect(JSON.parse(stringifyResult)).toHaveProperty(schemaEvolutionCountTag);
  });

  it("should correctly transform double nested objects", () => {
    const doubleNested = createEvolver();

    const nestedEvolver = createEvolver().addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver().addNested({
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
          name: "",
          age: 0,
        },
      },
    });
  });

  it("should correctly transform double nested objects with changes", () => {
    const doubleNested = createEvolver()
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "cheese",
        defaultVal: "swiss",
        schema: z.string(),
      });

    const nestedEvolver = createEvolver().addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver().addNested({
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
    const doubleNested = createEvolver();

    const nestedEvolver = createEvolver().addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver().addNested({
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
    const doubleNested = createEvolver();

    const nestedEvolver = createEvolver().addNested({
      path: "doubleNested",
      defaultVal: {
        age: 0,
        name: "",
      },
      nestedMigrator: doubleNested,
      schema: z.object({ name: z.string(), age: z.number() }),
    });

    const evolver = createEvolver().addNested({
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
    const nestedEvolver = createEvolver();

    const evolver = createEvolver().addNested({
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
    const nestedEvolver = createEvolver();

    const evolver = createEvolver().addNested({
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
    const nestedEvolver = createEvolver();

    const evolver = createEvolver().addNested({
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
    const evolver = createEvolver().remove("age");

    expect(evolver.transform({})).toEqual({ name: "" });
    expect(evolver.transform({ name: "Jon" })).toEqual({ name: "Jon" });

    // Type Test
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (): { name: string } => evolver.transform({});
  });
});

describe("transform", () => {
  it("should strip types at default", () => {
    const evolver = createEvolver();
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const transformed = evolver.transform(result);
    expect(transformed).not.toHaveProperty(schemaEvolutionCountTag);
    expect(transformed).not.toHaveProperty(versionTag);
  });

  it("should allow props through if not stripped", () => {
    const evolver = createEvolver();
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const transformed = evolver.transform(result, { strip: false });
    expect(transformed).toHaveProperty(schemaEvolutionCountTag);
  });

  it("should apply no transforms when unchanged", () => {
    const evolver = createEvolver();
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    evolver.transform(result);

    expect(evolver.__get_private_data().transformsAppliedCount).toBe(0);
  });

  it("should apply remaining transforms when changed", () => {
    const evolver = createEvolver();
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
    const evolver = createEvolver();
    evolver.transform({ name: "jon" });
    expect(evolver.__get_private_data().transformsAppliedCount).toBe(1);
  });

  it("should appropriately tag the schema when starting with schema", () => {
    const evolver = createZodMigrations({
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
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
      schema: z.object({
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

  const evolver = createZodMigrations({ schema: restaurantSchema })
    .add({
      path: "menus",
      schema: z.array(menuSchema),
      defaultVal: [],
    })
    .register("menus", createZodMigrations({ schema: z.array(menuSchema) }));

  const safeSchema: typeof restaurantWithChildren = evolver.safeSchema(
    restaurantWithChildren
  );

  type A = z.infer<typeof restaurantWithChildren>;
  type B = z.infer<typeof safeSchema>;

  const badEvolver = evolver.remove("name");

  // should be type never if evolver is missing fields in schema
  const badEvolverSchema = badEvolver.safeSchema(restaurantWithChildren);
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

describe("mutate", () => {
  it("should work just like add with add mutator", () => {
    const evolver = createEvolver().mutate(() =>
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
    const evolver = createEvolver()
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
    const evolver = createEvolver()
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
    const evolver = createEvolver()
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
      evolver: createEvolver()
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
    const evolver = createEvolver().addMany({
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
    const evolver = createEvolver().mutate(() =>
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

    const evolver = createEvolver()
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
    const evolver = createEvolver()
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
