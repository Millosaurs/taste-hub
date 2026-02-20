import type { FlavorProfile, TasteTag } from "../schema";

const TAG_SEEDS: Record<TasteTag, Partial<FlavorProfile>> = {
  purist: { spice: -1.5, sweet: -1.0, salty: -0.5, bitter: -0.5 },
  heat: { spice: 2.5 },
  citrus: { sour: 2.0, sweet: 0.5 },
  sweet: { sweet: 2.5, sour: 0.5 },
  herby: { umami: 1.5, bitter: 0.8 },
  savory: { umami: 2.0, salty: 1.5 },
};

const BASE: FlavorProfile = {
  spice: 5.0,
  sweet: 5.0,
  salty: 5.0,
  sour: 5.0,
  bitter: 5.0,
  umami: 5.0,
};

export function seedProfileFromTags(tags: TasteTag[]): FlavorProfile {
  const p = { ...BASE };
  for (const tag of tags) {
    const seeds = TAG_SEEDS[tag];
    if (seeds) {
      for (const [k, delta] of Object.entries(seeds)) {
        const key = k as keyof FlavorProfile;
        p[key] = Math.min(10, Math.max(0, p[key] + (delta ?? 0)));
      }
    }
  }
  return p;
}
