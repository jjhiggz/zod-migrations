/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { z } from "zod";
import { mutators } from "../../src";

describe("mutate.up", () => {
  it("should work with removeOne", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema,
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
});

describe("mutate.isValid", () => {
  it("isValid should succeed if path does not exist", () => {
    const valid = mutators.removeOne<{ name: string }, "name">("name").isValid({
      input: {} as any,
      paths: [],
      renames: [],
    });

    expect(valid).toBe(true);
  });

  it("isValid should fail if path does exist", () => {
    const valid = mutators.removeOne<{ name: string }, "name">("name").isValid({
      input: { name: "jon" } as any,
      paths: ["name"],
      renames: [],
    });

    expect(valid).toBe(false);
  });

  /* TODO: 
  Do I actually want this? So isValid is designed to take an input
  and help it determine where in the chain it first becomes invalid.
  My worry about this is if we say it's invalid, before it is invalid,
  then we are going to skip vital transformations
  */
  it("isValid should fail if path does exist in rename", () => {
    const valid = mutators.removeOne<{ name: string }, "name">("name").isValid({
      input: { newName: "jon" } as any,
      paths: ["newName"],
      renames: [["name", "newName"]],
    });

    expect(valid).toBe(false);
  });

  it("isValid should fail if path does exist in rename", () => {
    const valid = mutators.removeOne<{ name: string }, "name">("name").isValid({
      input: { newName: "jon" } as any,
      paths: ["newName"],
      renames: [["name", "newName"]],
    });

    expect(valid).toBe(false);
  });
});

describe("mutate.rewritePaths", () => {
  it("should remove path from paths", () => {
    const { rewritePaths } = mutators.removeOne<{ name: string }, "name">(
      "name"
    );

    assertPathsEqual(rewritePaths([{ path: "name", schema: z.string() }]), []);
  });
});

describe("mutate.rewriteRenames", () => {
  it("should  not remove renames if points to the field that is renamed", () => {
    const rewriteRenames = mutators.removeOne<
      { name: string; age: number },
      "name"
    >("name").rewriteRenames;

    const result = rewriteRenames({
      renames: [
        ["a", "b"],
        ["startName", "firstName"],
        ["firstName", "name"],
        ["c", "d"],
      ],
    });
    expect(result).toEqual([
      ["a", "b"],
      ["startName", "firstName"],
      ["firstName", "name"],
      ["c", "d"],
    ]);
  });
});

describe("mutate.beforeMutate", () => {
  it("should throw an error if referencing a path that's already there", async () => {
    const beforeMutateResult = await Promise.resolve()
      .then(() => {
        mutators.removeOne<{ name: string }, "name">("name").beforeMutate({
          paths: [],
        });
      })
      .catch((e) => e);

    expect(beforeMutateResult).toBeInstanceOf(Error);
    expect(beforeMutateResult.message).toBe(`Path name not found`);
  });
  it("should not throw error if path found", async () => {
    const beforeMutateResult = await Promise.resolve()
      .then(() => {
        mutators.removeOne<{ name: string }, "name">("name").beforeMutate({
          paths: [{ path: "name", schema: z.string() }],
        });
      })
      .catch((e) => e);

    expect(beforeMutateResult).not.toBeInstanceOf(Error);
  });
});

describe("tests with migrator", () => {
  it("should poop out the right thing", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.omit({ age: true }),
    }).remove("age");

    expect(evolver.transform({})).toEqual({ name: "" });
    expect(evolver.transform({ name: "Jon" })).toEqual({ name: "Jon" });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (): { name: string } => evolver.transform({});
  });
});
