import { describe, it, expect } from "bun:test";
import { createJsonEvolver, JsonEvolver } from "../json-evolution";
import { z } from "zod";

const schemaEvolutionCountTag = "__json_evolver_schema_evolution_count";

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
    expect(JSON.parse(stringifyResult)).toHaveProperty(
      "__json_evolver_schema_evolution_count"
    );
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
    expect(
      JSON.parse(stringifyResult)["nested"][
        "__json_evolver_schema_evolution_count"
      ]
    ).toBe(2);
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

describe("transform counts", () => {
  it("should apply no transforms when unchanged", () => {
    const evolver = createEvolver();
    const result = JSON.parse(evolver.stringify({ name: "jon", age: 30 }));

    evolver.transform(result);

    expect(evolver.transformsAppliedCount).toBe(0);
  });

  it("should apply remaining transforms when changed", () => {
    const evolver = createEvolver();
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

    expect(evolver2.transformsAppliedCount).toBe(2);
  });

  it("should apply all transforms no matter what if not from stringified entities", () => {
    const evolver = createEvolver();
    evolver.transform({ name: "jon" });
    expect(evolver.transformsAppliedCount).toBe(2);
  });

  it("should appropriately tag the schema when starting with schema", () => {
    const evolver = createJsonEvolver({
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
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
    const evolver = createJsonEvolver({
      schema: z.object({
        name: z.string(),
        age: z.number(),
      }),
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

    expect(evolver2.transformsAppliedCount).toBe(2);
  });
});
