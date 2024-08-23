/* eslint-disable @typescript-eslint/no-unused-vars */
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
  it("should mutate up properly", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema
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
      .registerMutator((shape) => {
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

describe("mutate.isValid", () => {
  it("is valid if all ", () => {});
});

describe("mutate.rewritePaths", () => {
  it("removes all keys from the paths, and adds all values to the paths with the correct schemas", () => {
    const rewritePaths = mutators.renameMany<
      { name: string; age: number; unchanged: string },
      { name: "newName"; age: "newAge" }
    >({
      renames: { name: "newName", age: "newAge" },
    }).rewritePaths;
    const actual = rewritePaths([
      { path: "name", schema: z.string() },
      { path: "age", schema: z.number() },
      { path: "unchanged", schema: z.string() },
    ]);

    const expected = [
      { path: "newName", schema: z.string() },
      { path: "newAge", schema: z.number() },
      { path: "unchanged", schema: z.string() },
    ];

    assertPathsEqual(actual, expected);
  });
});

describe("mutate.rewriteRenames", () => {
  it("renames all nessecary things", () => {
    const rewriteRenames = mutators.renameMany<
      { name: string; age: number; unchanged: string },
      { name: "newName"; age: "newAge" }
    >({
      renames: { name: "newName", age: "newAge" },
    }).rewriteRenames;

    const actual = rewriteRenames({ renames: [] });

    const expected = [
      ["name", "newName"],
      ["age", "newAge"],
    ];

    expect(actual).toEqual(expected);
  });

  it("tracks all old renames, so that can be back tracked on later", () => {
    const rewriteRenames = mutators.renameMany<
      { name: string; age: number; unchanged: string },
      { name: "newName"; age: "newAge" }
    >({
      renames: { name: "newName", age: "newAge" },
    }).rewriteRenames;

    const actual = rewriteRenames({
      renames: [
        ["name", "newName"],
        ["newName", "name"],
      ],
    });

    const expected = [
      ["name", "newName"],
      ["newName", "name"],
      ["name", "newName"],
      ["age", "newAge"],
    ];

    expect(actual).toEqual(expected);
  });
});

describe("mutate.beforeMutate", () => {
  it("doesn't throw an error if all rename keys exist, and values don't exist", async () => {
    const beforeMutate = mutators.renameMany<
      { name: string; age: number; unchanged: string },
      { name: "newName"; age: "newAge" }
    >({
      renames: { name: "newName", age: "newAge" },
    }).beforeMutate;

    const result = await Promise.resolve()
      .then(() => {
        beforeMutate({
          paths: [
            { path: "name", schema: z.string() },
            { path: "age", schema: z.number() },
            { path: "unchanged", schema: z.string() },
          ],
        });
        return true;
      })
      .catch((e) => e);

    expect(result).not.toBeInstanceOf(Error);
  });

  it("throws an error if all rename keys exist, but conflicting values do exist", async () => {
    const beforeMutate = mutators.renameMany<
      { name: string; age: number; unchanged: string },
      { name: "newName"; age: "newAge" }
    >({
      // @ts-expect-error this is an invalid state but we need to test it
      renames: { name: "newName", age: "newAge", newAge: 1 },
    }).beforeMutate;

    const result = await Promise.resolve()
      .then(() => {
        beforeMutate({
          paths: [
            { path: "name", schema: z.string() },
            { path: "newName", schema: z.string() },
            { path: "age", schema: z.number() },
            { path: "unchanged", schema: z.string() },
          ],
        });
        return true;
      })
      .catch((e) => e);

    expect(result).toBeInstanceOf(Error);
  });
});

describe("full transforms test", () => {
  it("should work for builtin rename many", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema
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
        ZodMigratorEndShape<typeof evolver>,
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
});
