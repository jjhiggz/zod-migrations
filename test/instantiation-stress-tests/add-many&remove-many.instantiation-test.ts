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
  .removeMany(["age", "name"])
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .removeMany(["age", "name"])
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .removeMany(["age", "name"])
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .removeMany(["age", "name"])
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .removeMany(["age", "name"])
  .addMany({
    defaultValues: { name: "", age: 0 },
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
  })
  .removeMany(["age", "name"]);

//   That's the limit.... fuck
