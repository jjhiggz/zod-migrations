import { z } from "zod";
import { menuEvoSchema, safeMenuSchema } from "./menu.schema";
import { JsonEvolver, type GetJsonEvolverShape } from "../../json-evolution";
import type { Equals } from "../../types/Equals";

const restaurantSchema = z.object({
  name: z.string(),
});

const restaurantWithChildrenSchema = restaurantSchema.merge(
  z.object({
    menus: z.array(safeMenuSchema),
  })
);

export const restaurantWithChildrenEvoSchema = new JsonEvolver()
  .add({
    path: "name",
    schema: z.string(),
    defaultVal: "",
  })
  .add({
    path: "menus",
    schema: z.array(safeMenuSchema),
    defaultVal: [],
  })
  .register("menus", menuEvoSchema);

type A = ReturnType<(typeof restaurantWithChildrenEvoSchema)["transform"]>;

const checkEvoTypeRestaurant = (): 1 => {
  return 1 as Equals<
    ReturnType<(typeof restaurantWithChildrenEvoSchema)["transform"]>,
    z.infer<typeof restaurantWithChildrenSchema>
  >;
};

// export const safeRestaurantSchema = z.preprocess((input) => {
//   const output = restaurantWithChildrenEvoSchema.transform(input);
//   return output;
// }, restaurantWithChildrenSchema.passthrough());

export const safeRestaurantSchema = restaurantWithChildrenEvoSchema.safeSchema(
  restaurantWithChildrenSchema
);
