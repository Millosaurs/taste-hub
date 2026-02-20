import { db, dishes } from "@idt-shit/db";
import type { Dish } from "@idt-shit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const dishesRouter = {
  // Get all active dishes
  getAll: publicProcedure.handler(async (): Promise<Dish[]> => {
    const result = await db.query.dishes.findMany({
      where: eq(dishes.active, true),
    });
    return result;
  }),

  // Get dish by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }): Promise<Dish | null> => {
      const result = await db.query.dishes.findFirst({
        where: eq(dishes.id, input.id),
      });
      return result ?? null;
    }),

  // Create a new dish (for seeding/admin)
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        flavor_tags: z.array(z.string()),
      })
    )
    .handler(async ({ input }): Promise<Dish> => {
      const [dish] = await db
        .insert(dishes)
        .values({
          name: input.name,
          flavor_tags: input.flavor_tags,
          active: true,
        })
        .returning();
      
      if (!dish) {
        throw new Error("Failed to create dish");
      }
      
      return dish;
    }),
};
