import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { z } from "zod";
import { mutators, testAllVersions } from "../../src";
import { Equals } from "../../src/types/Equals";
import { ZodMigratorEndShape } from "../../src/types/types";

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
