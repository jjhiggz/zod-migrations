import { z } from "zod";

export const initialMenuSchema = z.object({
  type: z.literal("MENU"),
  id: z.string(),
  name: z.string(),
});
