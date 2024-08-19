import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { schemaEvolutionCountTag, versionTag } from "../../src";
import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";

describe("transform", () => {
  it("should strip types at default", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const transformed = evolver.transform(result);
    expect(transformed).not.toHaveProperty(schemaEvolutionCountTag);
    expect(transformed).not.toHaveProperty(versionTag);
  });

  it("should allow props through if not stripped", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const transformed = evolver.transform(result, { strip: false });
    expect(transformed).toHaveProperty(schemaEvolutionCountTag);
  });

  it("should apply no transforms when unchanged", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    evolver.transform(result);

    expect(evolver.__get_private_data().transformsAppliedCount).toBe(0);
  });

  it("should apply remaining transforms when changed", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const evolver2 = evolver
      .add({
        path: "motto",
        defaultVal: "",
        schema: z.string(),
      })
      .rename({
        source: "name",
        destination: "first-name",
      });

    evolver2.transform(result);

    expect(evolver2.__get_private_data().transformsAppliedCount).toBe(2);
  });

  it("should only apply necessary transforms", () => {
    const evolver = createTestMigrator({ endingSchema: testBasePersonSchema });
    evolver.transform({ name: "jon" });
    expect(evolver.__get_private_data().transformsAppliedCount).toBe(1);
  });

  it("should appropriately tag the schema when starting with schema", () => {
    const startingSchema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const evolver = createZodMigrations({
      startingSchema,
      endingSchema: startingSchema,
    });

    const stringified = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    expect(stringified[schemaEvolutionCountTag]).toBe(0);

    const evolver2 = evolver.add({
      path: "lastName",
      defaultVal: "",
      schema: z.string(),
    });

    const stringified2 = JSON.parse(
      evolver2.stringify({ name: "jon", age: 30 })
    );

    expect(stringified2[schemaEvolutionCountTag]).toBe(1);
  });

  it("should apply relevant transforms only when starting from a schema", () => {
    const evolver = createZodMigrations({
      startingSchema: z.object({
        name: z.string(),
        age: z.number(),
      }),
      endingSchema: testBasePersonSchema,
    });

    const stringified = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    const evolver2 = evolver
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "lastName",
        defaultVal: "",
        schema: z.string(),
      });

    evolver2.transform(stringified);

    expect(evolver2.__get_private_data().transformsAppliedCount).toBe(2);
  });
});
