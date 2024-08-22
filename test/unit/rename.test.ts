import { describe, expect, it } from "vitest";
import {
  assertPathsEqual,
  createTestMigrator,
  testBasePersonSchema,
} from "../utils";
import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";
import { mutators } from "../../src";

describe("mutator.up", () => {
  it("should work with rename", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
        z.object({
          pizza: z.string(),
        })
      ),
    })
      .add({
        defaultVal: "",
        path: "cheese",
        schema: z.string(),
      })
      .mutate(() => mutators.rename("cheese", "pizza"));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
      pizza: "",
    });
  });
});

describe("mutate.isValid", () => {
  // I'm actually not sure this should be the case
  it("should be invalid if source path found ", () => {
    const isValid = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).isValid;

    expect(
      isValid({
        input: { name: "jon" },
        paths: [],
        renames: [["name", "newName"]],
      })
    ).toBe(false);
  });

  it("should be invalid if source path found ", () => {
    const isValid = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).isValid;

    expect(
      isValid({
        input: { name: "jon" },
        paths: [],
        renames: [],
      })
    ).toBe(false);
  });

  it("is valid if  destination found", () => {
    const isValid = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).isValid;

    expect(
      isValid({
        input: { newName: "jon", name: "dummy" },
        paths: [],
        renames: [],
      })
    ).toBe(true);
  });

  it("is valid if it WILL get renamed to the correct value", () => {
    const isValid = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).isValid;

    expect(
      isValid({
        input: { newName: "jon" },
        paths: [],
        renames: [
          ["name", "newName"],
          ["newName", "newNewName"],
        ],
      })
    ).toBe(true);
  });
  it("should be valid");
});

describe("mutate.rewritePaths", () => {
  it("filters out source and adds destination", () => {
    const rewritePaths = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).rewritePaths;
    assertPathsEqual(rewritePaths([{ path: "name", schema: z.string() }]), [
      { path: "newName", schema: z.string() },
    ]);
  });
});

describe("mutate.rewriteRenames", () => {
  it("adds renames", () => {
    const rewriteRenames = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).rewriteRenames;

    expect(rewriteRenames({ renames: [] })).toEqual([["name", "newName"]]);
  });

  it("adds renames if there are existing renames", () => {
    const rewriteRenames = mutators.rename<{ name: string }, "name", "newName">(
      "name",
      "newName"
    ).rewriteRenames;

    expect(rewriteRenames({ renames: [["a", "b"]] })).toEqual([
      ["a", "b"],
      ["name", "newName"],
    ]);
  });
});

describe("mutator.beforeMutate", () => {
  it("should throw an error for name conflict", async () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.merge(
        z.object({
          random: z.string(),
          random2: z.string(),
        })
      ),
    })
      .add({
        path: "random",
        schema: z.string(),
        defaultVal: "",
      })
      .add({
        path: "random2",
        schema: z.string(),
        defaultVal: "",
      });

    const source = "random2";
    const destination = "random";

    const result = await Promise.resolve()
      .then(() => {
        return evolver.rename({
          source: "random2",
          destination: "random",
        });
      })
      .catch((e) => {
        expect(e.message).toBe(
          `Cannot rename '${source}' to  '${destination}' because it already exists in your schema`
        );
        return null;
      });

    expect(result).toBe(null);
    /*  */
  });
});

describe("full transform tests", () => {
  it("should build an object from scratch", () => {
    const evolverBefore = createTestMigrator({
      endingSchema: testBasePersonSchema.omit({ name: true }).merge(
        z.object({
          firstName: z.string(),
        })
      ),
    });

    const evolver = evolverBefore.rename({
      source: "name",
      destination: "firstName",
    });

    expect(evolver.transform({}).firstName).toEqual("");
    expect(evolver.transform({ name: "jon" }).firstName).toEqual("jon");
  });

  it("should not explode when a valid previous version is put in", async () => {
    const initialPersonSchema = z.object({
      name: z.string(),
    });

    const currentPersonSchema = z.object({
      firstName: z.string(),
      lastName: z.string(),
    });

    const personEvolver = createZodMigrations({
      startingSchema: initialPersonSchema,
      endingSchema: currentPersonSchema,
    })
      .rename({
        source: "name",
        destination: "firstName",
      })
      .add({
        path: "lastName",
        schema: z.string(),
        defaultVal: "",
      })
      .safeSchema();

    const result = await personEvolver
      .parseAsync({ firstName: "jon" })
      .catch((e) => {
        console.error(e);
        return null;
      });

    expect(result).toEqual({ firstName: "jon", lastName: "" });
  });
});
