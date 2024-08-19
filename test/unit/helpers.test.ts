import { describe, expect, it } from "vitest";
import { getValidRenames } from "../../src/mutators";
import { testAllVersions } from "../../src";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { z } from "zod";

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

describe("checkAllVersions", () => {
  it("should test all versions", () => {
    testAllVersions({
      evolver: createTestMigrator({
        endingSchema: testBasePersonSchema
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
