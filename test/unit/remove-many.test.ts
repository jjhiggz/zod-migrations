import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
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
