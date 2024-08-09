import { z } from "zod";
import { JsonEvolver } from "../../zod-evolution";
import type { Equals } from "../../types/Equals";

const menuSchema = z.object({
  name: z.string(),
  age: z.number(),
});

export const menuEvoSchema = new JsonEvolver()
  .add({
    path: "name",
    schema: z.string(),
    defaultVal: "",
  })
  .add({
    path: "age",
    schema: z.number(),
    defaultVal: 1,
  });

const checkEvoTypeMenu = (): 1 => {
  return 1 as Equals<
    ReturnType<(typeof menuEvoSchema)["transform"]>,
    z.infer<typeof menuSchema>
  >;
};

export const safeMenuSchema = z.preprocess((input) => {
  return menuEvoSchema.transform(input);
}, menuSchema.passthrough());
