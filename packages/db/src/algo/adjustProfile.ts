import type { Dish, FeedbackEntry, FlavorProfile } from "../schema";

// How much each button choice nudges the relevant score
const SPICE_MAP = { too_mild: -2.0, just_right: 0, too_hot: +2.0 } as const;
const SWEET_MAP = { not_sweet: -1.5, just_right: 0, too_sweet: +1.5 } as const;
const SALT_MAP = { bland: -1.5, just_right: 0, too_salty: +1.5 } as const;

const NUDGE_BASE = 1.2;
const DECAY_RATE = 0.85; // nudges get smaller as visit count grows

function nudgeToward(current: number, target: number, amount: number): number {
  const diff = target - current;
  return current + Math.sign(diff) * Math.min(Math.abs(diff), amount);
}

function clamp(v: number): number {
  return Math.min(10, Math.max(0, v));
}

export function adjustProfile(
  current: FlavorProfile,
  feedback: FeedbackEntry,
  dish: Dish,
  visitCount: number
): FlavorProfile {
  const p = { ...current };
  const nudge = NUDGE_BASE * Math.pow(DECAY_RATE, Math.max(0, visitCount - 1));

  // Direct button adjustments
  if (feedback.spice_rating && feedback.spice_rating !== "just_right") {
    const delta = SPICE_MAP[feedback.spice_rating];
    p.spice = clamp(p.spice + delta * (nudge / NUDGE_BASE));
  }
  if (feedback.sweet_rating && feedback.sweet_rating !== "just_right") {
    const delta = SWEET_MAP[feedback.sweet_rating];
    p.sweet = clamp(p.sweet + delta * (nudge / NUDGE_BASE));
  }
  if (feedback.salt_rating && feedback.salt_rating !== "just_right") {
    const delta = SALT_MAP[feedback.salt_rating];
    p.salty = clamp(p.salty + delta * (nudge / NUDGE_BASE));
  }

  // Overall like/dislike nudges dish flavor tags
  const vibeDir =
    feedback.liked_overall === true ? 1 : feedback.liked_overall === false ? -1 : 0;
  if (vibeDir !== 0 && dish.flavor_tags) {
    for (const tag of dish.flavor_tags) {
      if (tag in p) {
        const k = tag as keyof FlavorProfile;
        p[k] = nudgeToward(p[k], vibeDir > 0 ? 10 : 0, nudge * 0.5);
      }
    }
  }

  // Would order again = strong positive signal across all dish tags
  if (feedback.would_order_again === true && dish.flavor_tags) {
    for (const tag of dish.flavor_tags) {
      if (tag in p) {
        p[tag as keyof FlavorProfile] = clamp(
          p[tag as keyof FlavorProfile] + nudge * 0.4
        );
      }
    }
  }

  return p;
}

export function computeAvgVibe(entries: FeedbackEntry[]): number {
  if (!entries.length) return 0;
  return Math.round(
    entries.reduce((s, e) => s + (e.vibe_score ?? 0), 0) / entries.length
  );
}

export function computeConfidence(visitCount: number): number {
  return Math.min(visitCount / 8, 1.0);
}
