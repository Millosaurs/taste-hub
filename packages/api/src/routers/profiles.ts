import { db, tasteProfiles } from "@idt-shit/db";
import type { TasteProfile, User } from "@idt-shit/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

export type ProfileWithUser = TasteProfile & { user: User };

export const profilesRouter = {
  // Get profile by phone number
  getByPhone: publicProcedure
    .input(z.object({ phone: z.string() }))
    .handler(async ({ input }): Promise<TasteProfile | null> => {
      const result = await db.query.tasteProfiles.findFirst({
        where: eq(tasteProfiles.phone_number, input.phone),
      });
      return result ?? null;
    }),

  // Get all profiles with user info (for dashboard)
  getAll: publicProcedure.handler(async (): Promise<ProfileWithUser[]> => {
    const profiles = await db.query.tasteProfiles.findMany({
      with: {
        user: true,
      },
    });

    // Filter out any profiles without users and sort by visit count
    return profiles
      .filter((p): p is TasteProfile & { user: User } => p.user !== null)
      .sort((a, b) => (b.user.visit_count ?? 0) - (a.user.visit_count ?? 0));
  }),
};
