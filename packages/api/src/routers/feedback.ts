import {
  db,
  feedbackEntries,
  tasteProfiles,
  users,
  dishes,
  adjustProfile,
  classifyProfile,
  computeAvgVibe,
  computeConfidence,
} from "@idt-shit/db";
import type { FeedbackEntry, TasteProfile, FlavorProfile, Dish } from "@idt-shit/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";

// Type for feedback entry with dish info
export type FeedbackEntryWithDish = FeedbackEntry & {
  dish: Dish | null;
};

const feedbackInputSchema = z.object({
  phone_number: z.string(),
  dish_id: z.string().nullable(),
  liked_overall: z.boolean().nullable(),
  spice_rating: z.enum(["too_mild", "just_right", "too_hot"]).nullable(),
  sweet_rating: z.enum(["not_sweet", "just_right", "too_sweet"]).nullable(),
  salt_rating: z.enum(["bland", "just_right", "too_salty"]).nullable(),
  texture_rating: z.enum(["bad", "okay", "great"]).nullable(),
  would_order_again: z.boolean().nullable(),
  vibe_score: z.number().min(0).max(100),
});

export const feedbackRouter = {
  // Submit feedback and update profile
  submit: publicProcedure
    .input(feedbackInputSchema)
    .handler(async ({ input }): Promise<TasteProfile> => {
      // 1. Insert feedback entry
      const [entry] = await db
        .insert(feedbackEntries)
        .values({
          phone_number: input.phone_number,
          dish_id: input.dish_id,
          liked_overall: input.liked_overall,
          spice_rating: input.spice_rating,
          sweet_rating: input.sweet_rating,
          salt_rating: input.salt_rating,
          texture_rating: input.texture_rating,
          would_order_again: input.would_order_again,
          vibe_score: input.vibe_score,
        })
        .returning();

      if (!entry) {
        throw new Error("Failed to create feedback entry");
      }

      // 2. Get current profile
      const currentProfile = await db.query.tasteProfiles.findFirst({
        where: eq(tasteProfiles.phone_number, input.phone_number),
      });

      // 3. Get user visit count
      const user = await db.query.users.findFirst({
        where: eq(users.phone_number, input.phone_number),
      });

      // 4. Get dish if provided
      let dish = null;
      if (input.dish_id) {
        dish = await db.query.dishes.findFirst({
          where: eq(dishes.id, input.dish_id),
        });
      }

      // 5. Get all feedback entries for avg vibe calculation
      const allEntries = await db.query.feedbackEntries.findMany({
        where: eq(feedbackEntries.phone_number, input.phone_number),
      });

      // 6. Calculate updated profile
      const visitCount = (user?.visit_count ?? 0) + 1;
      const currentFlavorProfile: FlavorProfile = currentProfile
        ? {
            spice: currentProfile.spice ?? 5.0,
            sweet: currentProfile.sweet ?? 5.0,
            salty: currentProfile.salty ?? 5.0,
            sour: currentProfile.sour ?? 5.0,
            bitter: currentProfile.bitter ?? 5.0,
            umami: currentProfile.umami ?? 5.0,
          }
        : {
            spice: 5.0,
            sweet: 5.0,
            salty: 5.0,
            sour: 5.0,
            bitter: 5.0,
            umami: 5.0,
          };

      // If we have a dish, adjust the profile based on feedback
      const updatedFlavorProfile = dish
        ? adjustProfile(currentFlavorProfile, entry, dish, visitCount)
        : currentFlavorProfile;

      // 7. Classify the updated profile
      const category = classifyProfile(updatedFlavorProfile);

      // 8. Calculate avg vibe and confidence
      const avgVibe = computeAvgVibe(allEntries);
      const confidence = computeConfidence(visitCount);

      // 9. Upsert the taste profile
      const profileData = {
        phone_number: input.phone_number,
        ...updatedFlavorProfile,
        category_id: category.id,
        category_label: category.label,
        category_emoji: category.emoji,
        category_message: category.message,
        avg_vibe: avgVibe,
        confidence: confidence,
        last_updated: new Date().toISOString(),
      };

      const [updatedProfile] = await db
        .insert(tasteProfiles)
        .values(profileData)
        .onConflictDoUpdate({
          target: tasteProfiles.phone_number,
          set: profileData,
        })
        .returning();

      if (!updatedProfile) {
        throw new Error("Failed to update taste profile");
      }

      // 10. Increment user visit count
      if (user) {
        await db
          .update(users)
          .set({ visit_count: visitCount })
          .where(eq(users.phone_number, input.phone_number));
      }

      return updatedProfile;
    }),

  // Get all feedback entries for a phone number
  getByPhone: publicProcedure
    .input(z.object({ phone: z.string() }))
    .handler(async ({ input }): Promise<FeedbackEntry[]> => {
      const result = await db.query.feedbackEntries.findMany({
        where: eq(feedbackEntries.phone_number, input.phone),
        orderBy: [desc(feedbackEntries.created_at)],
      });
      return result;
    }),

  // Get all feedback entries with dish info for a phone number
  getByPhoneWithDishes: publicProcedure
    .input(z.object({ phone: z.string() }))
    .handler(async ({ input }): Promise<FeedbackEntryWithDish[]> => {
      const result = await db.query.feedbackEntries.findMany({
        where: eq(feedbackEntries.phone_number, input.phone),
        orderBy: [desc(feedbackEntries.created_at)],
        with: {
          dish: true,
        },
      });
      return result;
    }),
};
