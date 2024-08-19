// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { z } from "zod";
// import { createZodMigrations } from "../src/zod-migration";
// import { IsZodMigratorValid } from "../src/types/types";
// import { Equals } from "../src/types/Equals";

// function testSafeSchemaReturnType(): 1 {
//   const restaurantSchema = z.object({
//     name: z.string(),
//   });

//   const menuSchema = z.object({
//     menuName: z.string(),
//   });

//   const restaurantWithChildren = restaurantSchema.extend({
//     menus: z.array(menuSchema),
//   });

//   const evolver = createZodMigrations({
//     startingSchema: restaurantSchema,
//     endingSchema: restaurantWithChildren,
//   }).addNested({
//     path: "menus",
//     currentSchema: z.array(menuSchema),
//     defaultStartingVal: [],
//     nestedMigrator: createZodMigrations({
//       startingSchema: menuSchema,
//       endingSchema: restaurantWithChildren,
//     }),
//   });

//   const safeSchema = evolver.safeSchema();

//   function isEvolverValid(): true {
//     return true as IsZodMigratorValid<typeof evolver>;
//   }

//   type A = z.infer<typeof restaurantWithChildren>;
//   type B = z.infer<typeof safeSchema>;

//   const badEvolver = evolver.remove("name");

//   function isBadEvolverValid(): true {
//     // @ts-expect-error bad evolver shouldn't be valid
//     return true as IsZodMigratorValid<typeof badEvolver>;
//   }
//   // should explode if schema is missing fields in evolver
//   const otherBadEvolverSchema = badEvolver
//     .add({
//       path: "cheese",
//       defaultVal: "",
//       schema: z.string(),
//     })
//     .safeSchema();

//   function isOtherBadEvolverValid(): true {
//     // @ts-expect-error bad evolver shouldn't be valid
//     return true as IsZodMigratorValid<typeof otherBadEvolverSchema>;
//   }
//   // should
//   type C = z.infer<typeof restaurantWithChildren>;
//   type D = z.infer<typeof safeSchema>;

//   const canInstantiateNested: D = {
//     name: "restaurant",
//     menus: [
//       {
//         menuName: "menu 1",
//       },
//     ],
//   };

//   return 1 as Equals<A, B>;
// }
