import { db, users, tasteProfiles, seedProfileFromTags } from "@idt-shit/db";
import type { TasteTag, User } from "@idt-shit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export const usersRouter = {
  // Get user by phone number
  getByPhone: publicProcedure
    .input(z.object({ phone: z.string() }))
    .handler(async ({ input }): Promise<User | null> => {
      const result = await db.query.users.findFirst({
        where: eq(users.phone_number, input.phone),
      });
      return result ?? null;
    }),

  // Create a new user with initial profile
  create: publicProcedure
    .input(
      z.object({
        phone: z.string(),
        name: z.string().min(2).max(40),
        tags: z.array(
          z.enum(["purist", "heat", "citrus", "sweet", "herby", "savory"])
        ),
      })
    )
    .handler(async ({ input }): Promise<User> => {
      const tags = input.tags as TasteTag[];

      // Insert user
      const [user] = await db
        .insert(users)
        .values({
          phone_number: input.phone,
          name: input.name,
          taste_tags: tags,
          visit_count: 0,
        })
        .returning();

      if (!user) {
        throw new Error("Failed to create user");
      }

      // Create initial profile with seeded values
      const seededProfile = seedProfileFromTags(tags);
      await db.insert(tasteProfiles).values({
        phone_number: input.phone,
        ...seededProfile,
        category_id: "still_learning",
        category_label: "STILL DISCOVERING",
        category_emoji: "🔍",
        category_message: "Keep giving feedback — we are learning your palate!",
        avg_vibe: 0,
        confidence: 0,
      });

      return user;
    }),

  // Increment visit count
  incrementVisitCount: publicProcedure
    .input(z.object({ phone: z.string() }))
    .handler(async ({ input }): Promise<void> => {
      const user = await db.query.users.findFirst({
        where: eq(users.phone_number, input.phone),
      });

      if (user) {
        await db
          .update(users)
          .set({ visit_count: (user.visit_count ?? 0) + 1 })
          .where(eq(users.phone_number, input.phone));
      }
    }),
};
