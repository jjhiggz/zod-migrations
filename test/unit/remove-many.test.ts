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
      .mutate(() => mutators.removeMany(["cheese", "pizza"]));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });
});

describe("mutator.isValid", () => {
  const isValid = mutators.addMany({
    defaultValues: {
      age: 1,
      name: "jon",
    },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }).isValid;

  it("should be valid if every key points to a path with the right schema", () => {
    expect(
      isValid({
        input: {
          name: "jon",
          age: 1,
        },
        paths: ["name", "age"],
        renames: [],
      })
    ).toBe(true);
  });

  it("should not be valid if some key points to a path with the wrong schema", () => {
    expect(
      isValid({
        input: {
          name: "jon",
          age: "age string",
        },
        paths: ["name", "age"],
        renames: [],
      })
    ).toBe(false);
  });

  it("should not be valid if a key is missing", () => {
    expect(
      isValid({
        input: {
          age: "age string",
        },
        paths: ["age"],
        renames: [],
      })
    ).toBe(false);
  });

  it("should be valid with valid renames", () => {
    expect(
      isValid({
        input: {
          name: "jon",
          newAge: 1,
        },
        paths: ["age"],
        renames: [["age", "newAge"]],
      })
    ).toBe(true);
  });
});

describe("mutator.rewritePaths", () => {
  const rewritePaths = mutators.addMany({
    defaultValues: {
      name: "",
      age: 1,
    },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }).rewritePaths;

  it("should add all the keys from the shape", () => {
    assertPathsEqual(rewritePaths([]), [
      { path: "name", schema: z.string() },
      { path: "age", schema: z.number() },
    ]);
  });
});

describe.skip("mutator.rewriteRenames", () => {
  // TODO
});

describe.skip("mutator.rewriteRenames", () => {
  // TODO
});

describe.skip("mutator.beforeMutate", () => {
  // TODO
});
