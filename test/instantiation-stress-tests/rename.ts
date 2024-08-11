import { z } from "zod";
import { JsonEvolver } from "../../json-evolution";
import type { Equals } from "../../types/Equals";

export const dumbSchema = z.object({
  ["first-name"]: z.string(),
});

const dumbEvoSchema = new JsonEvolver()
  .add({
    path: "name",
    defaultVal: "",
    schema: z.string(),
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  });
  
const a : ReturnType<(typeof dumbEvoSchema)["transform"]> = {"first-name": "jon"}

const checkEvoTypeMenu = (): 1 => {
  return 1 as Equals<
    ReturnType<(typeof dumbEvoSchema)["transform"]>,
    z.infer<typeof dumbSchema>
  >;
};
