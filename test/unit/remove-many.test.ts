import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { z } from "zod";
import { mutators } from "../../src";

describe("mutator.up", () => {
  it("should work with removeMany", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema })
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
      .registerMutator(() => mutators.removeMany(["cheese", "pizza"]));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });
});

describe("mutator.isValid", () => {
  const isValid = mutators.removeMany<
    {
      name: string;
      age: number;
      other: string;
    },
    "name" | "age"
  >(["name", "age"]).isValid;

  it("Should be valid if removed fields do not exist", () => {
    expect(
      isValid({
        input: { other: "other value" },
        paths: ["other"],
        renames: [],
      })
    ).toBe(true);
  });

  /* TODO: 
  Do I actually want this? So isValid is designed to take an input
  and help it determine where in the chain it first becomes invalid.
  My worry about this is if we say it's invalid, before it is invalid,
  then we are going to skip vital transformations
  */
  it("Should be valid if removed fields do not exist", () => {
    expect(
      isValid({
        input: { other: "other value", newName: "Jimmy" },
        paths: ["other"],
        renames: [["name", "newName"]],
      })
    ).toBe(false);
  });
});

describe("mutator.rewritePaths", () => {
  const rewritePaths = mutators.removeMany<
    {
      name: string;
      age: number;
      dummy: string;
    },
    "name" | "age"
  >(["name", "age"]).rewritePaths;

  it("should remove all keys from paths", () => {
    assertPathsEqual(rewritePaths([{ path: "dummy", schema: z.number() }]), []);
  });
});

describe("mutator.rewriteRenames", () => {
  const rewriteRenames = mutators.removeMany<
    { name: string; age: number; other: string },
    "name" | "age"
  >(["name", "age"] as const).rewriteRenames;

  it("should  notremove renames that point to the same thing", () => {
    expect(
      rewriteRenames({
        renames: [["oldName", "name"]],
      })
    ).toEqual([["oldName", "name"]]);
  });
});

describe.skip("mutator.beforeMutate", () => {
  // TODO
});
