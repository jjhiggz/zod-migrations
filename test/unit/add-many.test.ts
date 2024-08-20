import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { z } from "zod";
import { mutators, testAllVersions } from "../../src";
import { Equals } from "../../src/types/Equals";
import { ZodMigratorEndShape } from "../../src/types/types";

describe("mutator.up", () => {
  it("should work as expected with default values", () => {
    const result = mutators
      .addMany({
        defaultValues: { name: "default", age: 10 },
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      })
      .up({ input: {} });

    expect(result).toEqual({
      name: "default",
      age: 10,
    });
  });
});

describe("mutate.isValid", () => {
  it("should be valid if valid numbers put in", () => {
    const result = mutators
      .addMany({
        defaultValues: { name: "default", age: 10 },
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      })
      .isValid({
        input: {
          name: "jon",
          age: 20,
        },
        // Does not depend on paths
        paths: [],
        renames: [],
      });

    expect(result).toEqual(true);
  });

  it("should be valid if an old name points to a valid rename", () => {
    const result = mutators
      .addMany({
        defaultValues: { name: "default", age: 10 },
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      })
      .isValid({
        input: {
          name: "jon",
          newAge: 20,
        },
        paths: [],
        renames: [["age", "newAge"]],
      });

    expect(result).toEqual(true);
  });
});

describe("mutator.rewritePaths", () => {
  it("should add all the paths from the migration", () => {
    const result = mutators
      .addMany({
        defaultValues: { name: "default", age: 10 },
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      })
      .rewritePaths([]);

    assertPathsEqual(result, [
      { path: "name", schema: z.string() },
      { path: "age", schema: z.number() },
    ]);
  });
});

describe("mutate.rewriteRenames", () => {
  it("should not rewrite renames", () => {
    const rewriteRenames = mutators.addMany({
      defaultValues: {
        name: "",
      },
      schema: z.object({
        name: z.string(),
      }),
    }).rewriteRenames;

    expect(rewriteRenames({ renames: [] })).toEqual([]);
  });
});

describe("mutate.beforeMutate", () => {
  it("shouldn't let me upload name conflict keys", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const result = await Promise.resolve()
      .then(() => {
        return (
          mutators
            // @ts-expect-error should break typescript
            .addMany<{ name: string; age: number }, typeof schema>({
              defaultValues: { name: "default", age: 10 },
              schema,
            })
            .beforeMutate({
              paths: [
                { path: "name", schema: z.string() },
                { path: "age", schema: z.number() },
              ],
            })
        );
      })
      .catch((e) => e);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(
      `These keys conflict with existing keys in your path: ${[
        "name",
        "age",
      ].join()}`
    );
  });
});

describe("type tests", () => {
  it("shouldn't break typescript if valid name put in", () => {
    const schema = z.object({ name: z.string(), age: z.number() });

    mutators
      //  Shouldn't break TS
      .addMany<{ otherVal: string }, typeof schema>({
        defaultValues: { name: "default", age: 10 },
        schema,
      });
  });
});

describe("full transform tests", () => {
  it("testAllVersions", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
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

  it("test all versions", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function correctEvolverShape(): 1 {
      return 1 as Equals<
        ZodMigratorEndShape<typeof evolver>,
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
