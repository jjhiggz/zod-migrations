import { describe, expect, it } from "vitest";
import { getAllValidRenames } from "../../src/mutators";
import { testAllVersions } from "../../src";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { z } from "zod";
import { pipe, sort } from "remeda";

const sortByAlphabetical = (input: string[]) => {
  return sort(input, (str1, str2) => {
    if (str1 > str2) return 1;
    if (str2 > str1) return -1;
    return 0;
  });
};

describe("getValidRenames", () => {
  it("should find one valid rename", () => {
    expect(getAllValidRenames([["name", "firstName"]], "name")).toEqual([
      "name",
      "firstName",
    ]);
  });

  it("should work if I rename twice", () => {
    expect(
      getAllValidRenames(
        [
          ["name", "firstName"],
          ["firstName", "newFirstName"],
        ],
        "name"
      )
    ).toEqual(["name", "firstName", "newFirstName"]);
  });

  it("should work if I rename twice backward", () => {
    const result = pipe(
      getAllValidRenames(
        [
          ["name", "firstName"],
          ["firstName", "newFirstName"],
        ],
        "newFirstName"
      ),
      sortByAlphabetical
    );
    expect(result).toEqual(
      sortByAlphabetical(["name", "firstName", "newFirstName"])
    );
  });

  it("should work if I rename back and forth", () => {
    expect(
      getAllValidRenames(
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
      getAllValidRenames(
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
