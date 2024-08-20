/* eslint-disable */
import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";
import {
  IsZodMigratorValid,
  RenameOutput,
  ZodMigratorCurrentShape,
  ZodMigratorEndShape,
} from "../../src/types/types";

export const dumbSchema = z.object({
  ["first-name"]: z.string(),
});

const endingSchema = z.object({
  "first-name": z.string(),
});

const startingSchema = z.object({});
const migrator = createZodMigrations<
  z.infer<typeof endingSchema>,
  z.infer<typeof startingSchema>
>({
  endingSchema: endingSchema,
  startingSchema: startingSchema,
})
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
  .consolidate<{ "first-name": string }>()
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
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

type CurrentShape = ZodMigratorCurrentShape<typeof migrator>;

// Need to figure out how to fix this
const a: ZodMigratorEndShape<typeof migrator> = {
  "first-name": "jon",
};

// type CurrentShape = ZodMigratorCurrentShape<typeof migrator>;
// type DumbEvoEvolverShape = ZodMigratorEndShape<typeof migrator>;
// type InferredZodShape = z.infer<typeof dumbSchema>;
type IsValid = IsZodMigratorValid<typeof migrator>;

const checkEvoTypeMenu = (): true => {
  return true as IsValid;
};
