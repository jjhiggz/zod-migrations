import { z } from "zod";
import { createZodMigrations } from "../../src/zod-migration";
import { IsZodMigratorValid } from "../../src/types/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const migrator = createZodMigrations({
  startingSchema: z.object({
    a1: z.string(),
    a2: z.string(),
    a3: z.string(),
    a4: z.string(),
    a5: z.string(),
    a6: z.string(),
    a7: z.string(),
    a8: z.string(),
    a9: z.string(),
    a10: z.string(),
  }),
  endingSchema: z.object({
    b1: z.string(),
    b2: z.string(),
    b3: z.string(),
    b4: z.string(),
    b5: z.string(),
    b6: z.string(),
    b7: z.string(),
    b8: z.string(),
    b9: z.string(),
    b10: z.string(),
  }),
})
  .renameMany({
    a1: "b1",
    a2: "b2",
    a3: "b3",
    a4: "b4",
    a5: "b5",
    a6: "b6",
    a7: "b7",
    a8: "b8",
    a9: "b9",
    a10: "b10",
  } as const)
  .renameMany({
    b1: "a1",
    b2: "a2",
    b3: "a3",
    b4: "a4",
    b5: "a5",
    b6: "a6",
    b7: "a7",
    b8: "a8",
    b9: "a9",
    b10: "a10",
  } as const)
  .renameMany({
    a1: "b1",
    a2: "b2",
    a3: "b3",
    a4: "b4",
    a5: "b5",
    a6: "b6",
    a7: "b7",
    a8: "b8",
    a9: "b9",
    a10: "b10",
  } as const)
  .renameMany({
    b1: "a1",
    b2: "a2",
    b3: "a3",
    b4: "a4",
    b5: "a5",
    b6: "a6",
    b7: "a7",
    b8: "a8",
    b9: "a9",
    b10: "a10",
  } as const)
  .renameMany({
    a1: "b1",
    a2: "b2",
    a3: "b3",
    a4: "b4",
    a5: "b5",
    a6: "b6",
    a7: "b7",
    a8: "b8",
    a9: "b9",
    a10: "b10",
  } as const)
  .renameMany({
    b1: "a1",
    b2: "a2",
    b3: "a3",
    b4: "a4",
    b5: "a5",
    b6: "a6",
    b7: "a7",
    b8: "a8",
    b9: "a9",
    b10: "a10",
  } as const)
  .renameMany({
    a1: "b1",
    a2: "b2",
    a3: "b3",
    a4: "b4",
    a5: "b5",
    a6: "b6",
    a7: "b7",
    a8: "b8",
    a9: "b9",
    a10: "b10",
  } as const);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isValid(): true {
  return true as IsZodMigratorValid<typeof migrator>;
}
// const a;
