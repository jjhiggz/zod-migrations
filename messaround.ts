import { z } from "zod";
import { createJsonEvolver } from "./json-evolution";

const originalRestaurantSchema = z.object({
  name: z.string(),
});

const currentRestaurantSchema = z.object({
  firstName: z.string(),
  address: z.string(),
  storeHours: z.string(),
});

const restaurantEvolver = createJsonEvolver({
  schema: originalRestaurantSchema,
});

const safeParseRestaurantSchema = restaurantEvolver
  .rename({
    source: "name",
    destination: "firstName",
  })
  .add({
    path: "address",
    schema: z.string(),
    defaultVal: "",
  })
  .add({
    path: "storeHours",
    schema: z.string(),
    defaultVal: "",
  })
  .safeSchema(currentRestaurantSchema);

console.clear();
console.log(
  safeParseRestaurantSchema.parse({
    name: "olivia",
    address: "1234 olivia lane",
  })
);
