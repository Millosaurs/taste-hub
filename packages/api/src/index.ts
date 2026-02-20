import { os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

// Re-export types for use in frontend
export type { ProfileWithUser } from "./routers/profiles";
export type { FeedbackEntryWithDish } from "./routers/feedback";
