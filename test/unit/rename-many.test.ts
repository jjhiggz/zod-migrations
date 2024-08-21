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

describe.skip("mutate.isValid", () => {
  // TODO
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

describe.skip("mutate.rewriteRenames", () => {});

describe.skip("mutate.beforeMutate", () => {
  // TODO
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
