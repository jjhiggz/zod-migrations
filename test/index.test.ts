import { describe, it, expect } from "bun:test";
import { JsonEvolver } from "../json-evolution";
import { z } from "zod";
import type { Equals } from "../types/Equals";

const createEvolver = () =>
  new JsonEvolver()
    .add({
      defaultVal: "",
      path: "name",
      schema: z.string(),
    })
    .add({
      path: "age",
      defaultVal: 0,
      schema: z.number(),
    });

describe("add", () => {
  it("should poop out all of the defaults if empty object put in", () => {
    const evolver = createEvolver();

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });
  it("should throw an error for name conflict", async () => {
    const evolver = createEvolver().add({
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

describe("rename", () => {
  it("should poop out the correct type", () => {
    const evolver = createEvolver().rename({
      source: "name",
      destination: "firstName",
    });
    expect(evolver.transform({}).firstName).toEqual("");
    expect(evolver.transform({ name: "jon" }).firstName).toEqual("jon");
  });
  it("should throw an error for name conflict", async () => {
    const evolver = createEvolver()
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

describe("stringify", () => {
  it("should tag an unnested object", () => {
    const evolver = createEvolver();

    const stringifyResult = evolver.stringify(evolver.transform({}));
    expect(JSON.parse(stringifyResult)).toHaveProperty("_zevo_version");
  });

  it("should tag a nested object with correct version", () => {
    const evolver = createEvolver();
    const nestedEvolver = createEvolver();

    evolver
      .add({
        path: "nested",
        defaultVal: {
          age: 1,
          name: "",
        },
        schema: z.object({
          name: z.string(),
          age: z.number(),
        }),
      })
      .register("nested", nestedEvolver);

    const stringifyResult = evolver.stringify(evolver.transform({}));
    expect(JSON.parse(stringifyResult)["nested"]["_zevo_version"]).toBe(2);
  });
});

describe("remove", () => {
  it("should poop out the right thing", () => {
    const evolver = createEvolver().remove("age");

    expect(evolver.transform({})).toEqual({ name: "" });
    expect(evolver.transform({ name: "Jon" })).toEqual({ name: "Jon" });

    // Type Test
    (): { name: string } => evolver.transform({});
  });
});
