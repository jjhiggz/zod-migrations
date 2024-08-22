import { z } from "zod";

export const initialRestaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("RESTAURANT"),
});
