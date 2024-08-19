import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";

createZodMigrations({
  startingSchema: z.object({}),
  endingSchema: z.object({
    name: z.string(),
  }),
})
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .remove("age")
  .remove("name")
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .remove("age")
  .remove("name")
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .remove("age")
  .remove("name")
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .remove("age")
  .remove("name");

//   That's the limit.... fuck
