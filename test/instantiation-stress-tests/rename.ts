/* eslint-disable */
import { z } from "zod";
import { ZodMigrations } from "../../src/zod-migration";
import type { Equals } from "../../src/types/Equals";
import { ZodMigratorEndShape } from "../../src/types/types";

export const dumbSchema = z.object({
  ["first-name"]: z.string(),
});

const dumbEvoSchema = new ZodMigrations()
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
  });

const a: ZodMigratorEndShape<typeof dumbEvoSchema> = {
  "first-name": "jon",
};

const checkEvoTypeMenu = (): 1 => {
  return 1 as Equals<
    ReturnType<(typeof dumbEvoSchema)["transform"]>,
    z.infer<typeof dumbSchema>
  >;
};
