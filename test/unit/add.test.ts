import { describe, expect, it } from "vitest";
import { z } from "zod";
import { mutators } from "../../src";
import { createZodMigrations } from "../../src/zod-migration";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";

describe("mutator.up", () => {
  it("should work", () => {
    const transformed = mutators
      .add({
        path: "someValue",
        defaultVal: "",
        schema: z.string(),
      })
      .up({
        input: {},
      });

    expect(transformed).toEqual({
      someValue: "",
    });
  });

  it("should work just like add with add mutator", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
        z.object({
          cheese: z.string(),
        })
      ),
    }).registerMutator(() =>
      mutators.add({
        defaultVal: "swiss",
        path: "cheese",
        schema: z.string(),
      })
    );

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
      cheese: "swiss",
    });
  });
});

describe("mutator.isValid", () => {
  it("isValid should succeed if path is there", () => {
    const valid = mutators
      .add({
        path: "someValue",
        schema: z.string(),
        defaultVal: "default",
      })
      .isValid({
        input: { someValue: "hello" },
        paths: [],
        renames: [],
      });

    expect(valid).toBe(true);
  });

  it("isValid should fail if path isn't there", () => {
    const valid = mutators
      .add({
        path: "someValue",
        schema: z.string(),
        defaultVal: "default",
      })
      .isValid({
        input: {},
        paths: [],
        renames: [],
      });

    expect(valid).toBe(false);
  });

  it("isValid should succeed if renamed path is there", () => {
    const valid = mutators
      .add({
        path: "nested",
        schema: z.string(),
        defaultVal: "",
      })
      .isValid({
        input: {
          "nested-sibling": "hello",
        },
        paths: [],
        renames: [["nested", "nested-sibling"]],
      });

    expect(valid).toBe(true);
  });
});

describe("mutate.rewritePaths", () => {
  it("should add the path to paths", () => {
    const rewritePaths = mutators.add({
      path: "name",
      schema: z.string(),
      defaultVal: "",
    }).rewritePaths;

    assertPathsEqual(rewritePaths([]), [{ path: "name", schema: z.string() }]);
  });
});

describe("mutate.rewriteRenames", () => {
  it("should not rewrite renames", () => {
    const rewriteRenames = mutators.add({
      path: "name",
      schema: z.string(),
      defaultVal: "",
    }).rewriteRenames;

    expect(rewriteRenames({ renames: [] })).toEqual([]);
  });
});

describe("mutator.beforeMutate", () => {
  it("should throw an error for name conflict", async () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema,
    }).add({
      defaultVal: "",
      path: "random",
      schema: z.string(),
    });

    const result = await Promise.resolve()
      .then(() =>
        evolver.add({ path: "random", defaultVal: "any", schema: z.string() })
      )
      .catch((e) => {
        expect(e.message).toBe("'random' already exists in your JsonEvolver");
        return null;
      });
    expect(result).toBe(null);
  });
});

describe("transform", () => {
  it("should work with a transform function", () => {
    const migrator = createZodMigrations({
      endingSchema: testBasePersonSchema,
      startingSchema: z.object({}),
    }).add({ defaultVal: "", path: "someValue", schema: z.string() });

    expect(migrator.transform({})).toEqual({
      someValue: "",
    });
  });

  it("should poop out all of the defaults if empty object put in", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });
});
