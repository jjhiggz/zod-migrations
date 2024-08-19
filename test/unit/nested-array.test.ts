import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { mutators } from "../../src";
import { z } from "zod";

describe("mutator.isValid", () => {
  it("isValid should succeed if path is there", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const valid = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .isValid({
        input: {
          nested: [],
        },
        paths: [],
        renames: [],
      });

    expect(valid).toBe(true);
  });

  it("isValid should fail if path isn't there", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const valid = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .isValid({
        input: {},
        paths: [],
        renames: [],
      });

    expect(valid).toBe(false);
  });

  it("isValid should succeed if renamed path is there", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const valid = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .isValid({
        input: {
          "nested-sibling": [],
        },
        paths: [],
        renames: [["nested", "nested-sibling"]],
      });

    expect(valid).toBe(true);
  });
});

describe("mutator.up", () => {
  it("should work base case", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema,
    });

    const transformed = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .up({
        input: {
          nested: [{}],
        },
      });

    expect(transformed).toEqual({
      nested: [
        {
          name: "",
          age: 0,
        },
      ],
    });
  });

  it("should evolve nested schemas and retain information", () => {
    const nestedMigrator = createTestMigrator({
      endingSchema: testBasePersonSchema
        .omit({
          name: true,
        })
        .merge(
          z.object({
            firstName: z.string(),
          })
        ),
    }).rename({
      source: "name",
      destination: "firstName",
    });

    const transformed = mutators
      .addNestedArray({
        nestedMigrator,
        path: "nested",
        currentSchema: testBasePersonSchema,
      })
      .up({
        input: {
          nested: [
            {
              name: "jon",
            },
          ],
        },
      });

    expect(transformed).toEqual({
      nested: [
        {
          firstName: "jon",
          age: 0,
        },
      ],
    });
  });
});
