import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// =====================================
// TYPE DEFINITIONS
// =====================================

export type TasteTag = "purist" | "heat" | "citrus" | "sweet" | "herby" | "savory";

export type SpiceRating = "too_mild" | "just_right" | "too_hot";
export type SweetRating = "not_sweet" | "just_right" | "too_sweet";
export type SaltRating = "bland" | "just_right" | "too_salty";
export type TextureRating = "bad" | "okay" | "great";

export type FlavorProfile = {
  spice: number;
  sweet: number;
  salty: number;
  sour: number;
  bitter: number;
  umami: number;
};

export type TasteCategory = {
  id: string;
  label: string;
  emoji: string;
  message: string;
};

// =====================================
// TABLES
// =====================================

// 1. Users - phone is primary key
export const users = sqliteTable("users", {
  phone_number: text("phone_number").primaryKey(),
  name: text("name").notNull(),
  taste_tags: text("taste_tags", { mode: "json" }).$type<TasteTag[]>().default([]),
  visit_count: integer("visit_count").default(0),
  first_seen_at: text("first_seen_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// 2. Dishes - kitchen managed
export const dishes = sqliteTable("dishes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  image_url: text("image_url"),
  flavor_tags: text("flavor_tags", { mode: "json" }).$type<string[]>().default([]),
  active: integer("active", { mode: "boolean" }).default(true),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// 3. Feedback entries - one row per user per dish interaction
export const feedbackEntries = sqliteTable("feedback_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  phone_number: text("phone_number")
    .notNull()
    .references(() => users.phone_number),
  dish_id: text("dish_id").references(() => dishes.id),
  liked_overall: integer("liked_overall", { mode: "boolean" }),
  spice_rating: text("spice_rating").$type<SpiceRating>(),
  sweet_rating: text("sweet_rating").$type<SweetRating>(),
  salt_rating: text("salt_rating").$type<SaltRating>(),
  texture_rating: text("texture_rating").$type<TextureRating>(),
  would_order_again: integer("would_order_again", { mode: "boolean" }),
  vibe_score: integer("vibe_score").default(0),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

// 4. Taste profiles - computed, one per user
export const tasteProfiles = sqliteTable("taste_profiles", {
  phone_number: text("phone_number")
    .primaryKey()
    .references(() => users.phone_number),
  // Flavor dimension scores 0.0-10.0
  spice: real("spice").default(5.0),
  sweet: real("sweet").default(5.0),
  salty: real("salty").default(5.0),
  sour: real("sour").default(5.0),
  bitter: real("bitter").default(5.0),
  umami: real("umami").default(5.0),
  // Computed category
  category_id: text("category_id").default("still_learning"),
  category_label: text("category_label").default("STILL DISCOVERING"),
  category_emoji: text("category_emoji").default("🔍"),
  category_message: text("category_message").default(
    "Keep giving feedback — we are learning your palate!"
  ),
  avg_vibe: real("avg_vibe").default(0),
  confidence: real("confidence").default(0),
  last_updated: text("last_updated").default(sql`(CURRENT_TIMESTAMP)`),
});

// =====================================
// RELATIONS
// =====================================

export const usersRelations = relations(users, ({ one, many }) => ({
  tasteProfile: one(tasteProfiles, {
    fields: [users.phone_number],
    references: [tasteProfiles.phone_number],
  }),
  feedbackEntries: many(feedbackEntries),
}));

export const dishesRelations = relations(dishes, ({ many }) => ({
  feedbackEntries: many(feedbackEntries),
}));

export const feedbackEntriesRelations = relations(feedbackEntries, ({ one }) => ({
  user: one(users, {
    fields: [feedbackEntries.phone_number],
    references: [users.phone_number],
  }),
  dish: one(dishes, {
    fields: [feedbackEntries.dish_id],
    references: [dishes.id],
  }),
}));

export const tasteProfilesRelations = relations(tasteProfiles, ({ one }) => ({
  user: one(users, {
    fields: [tasteProfiles.phone_number],
    references: [users.phone_number],
  }),
}));

// =====================================
// INFERRED TYPES
// =====================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Dish = typeof dishes.$inferSelect;
export type NewDish = typeof dishes.$inferInsert;

export type FeedbackEntry = typeof feedbackEntries.$inferSelect;
export type NewFeedbackEntry = typeof feedbackEntries.$inferInsert;

export type TasteProfile = typeof tasteProfiles.$inferSelect;
export type NewTasteProfile = typeof tasteProfiles.$inferInsert;
