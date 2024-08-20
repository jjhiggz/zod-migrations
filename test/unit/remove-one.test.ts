import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { z } from "zod";
import { mutators } from "../../src";

describe("remove", () => {
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

describe("mutate.rewriteRenames", () => {
  it("should remove renames if points to the field that is renamed", () => {
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
      ["c", "d"],
    ]);
  });
});
