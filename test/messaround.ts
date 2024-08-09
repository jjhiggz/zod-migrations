import type { ZodError } from "zod";
import {
  restaurantWithChildrenEvoSchema,
  safeRestaurantSchema,
} from "./entities/restaurant.schema";

const fakeDataBase: string[] = [];

const stringify = restaurantWithChildrenEvoSchema.stringify;
// Programmer Codes V1 of restaurant schema
// User 1 makes a restuarant
const restaurant = { name: "restaurant 1" };

fakeDataBase.push(JSON.stringify(restaurant));

// Programmer codes v2 of restauratn schema
// and V1 of menu schema
//User 2 makes a restaurant

fakeDataBase.push(
  stringify({
    name: "restaurant 2",
    menus: [
      {
        name: "menu test 2",
      },
    ],
  })
);

// Programmer adds age to menu
// User makes a restauaraunt
fakeDataBase.push(
  stringify({
    name: "restaurant test 3",
    menus: [
      {
        name: "menu 3",
        age: 3,
      },
    ],
  })
);

for (let i = 0; i < fakeDataBase.length; i++) {
  const fakeData = fakeDataBase[i];
  try {
    console.log("trying to parse:", fakeData);
    safeRestaurantSchema.parse(JSON.parse(fakeData));
    console.log("success");
  } catch (e) {
    console.log("failure");
    console.error((e as ZodError).issues);
    // console.error("failed on:", i);
    // console.error("failed on:", fakeData);
    // console.error((e as ZodError).issues);
  }
}
