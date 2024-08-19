/* eslint-disable */
import { z } from "zod";
import { createZodMigrations, ZodMigrations } from "../../src/zod-migration";
import type { Equals } from "../../src/types/Equals";
import {
  ZodMigratorCurrentShape,
  ZodMigratorEndShape,
} from "../../src/types/types";

export const dumbSchema = z.object({
  ["first-name"]: z.string(),
});

const migrator = createZodMigrations({
  endingSchema: z.object({
    "first-name": z.string(),
  }),
  startingSchema: z.object({}),
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

  // // TODO: Fix this type instantiation problem
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
    destination: "first-name",
  })
  .rename({
    source: "first-name",
    destination: "name",
  })
  .rename({
    source: "name",
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
// .rename({
//   source: "first-name",
//   destination: "name",
// })
// .rename({
//   source: "name",
//   destination: "first-name",
// });
// .rename({
//   source: "first-name",
//   destination: "name",
// })
// .rename({
//   source: "name",
//   destination: "first-name",
// })
// .rename({
//   source: "first-name",
//   destination: "name",
// })
// .rename({
//   source: "name",
//   destination: "first-name",
// })
// .rename({
//   source: "first-name",
//   destination: "name",
// });

// Need to figure out how to fix this
const a: ZodMigratorEndShape<typeof migrator> = {
  "first-name": "jon",
};

type CurrentShape = ZodMigratorCurrentShape<typeof migrator>;
type DumbEvoEvolverShape = ZodMigratorEndShape<typeof migrator>;
type InferredZodShape = z.infer<typeof dumbSchema>;

const checkEvoTypeMenu = (): 1 => {
  return 1 as Equals<DumbEvoEvolverShape, InferredZodShape>;
};
