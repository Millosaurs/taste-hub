import type { FlavorProfile, TasteCategory } from "../schema";

const H = (v: number) => v >= 6.5;
const L = (v: number) => v < 3.5;

const CATEGORIES: Array<TasteCategory & { condition: (p: FlavorProfile) => boolean }> = [
  {
    id: "all_rounder",
    label: "ALL ROUNDER",
    emoji: "🌈",
    message:
      "Your profile is categorised under ALL ROUNDER — you like everything and the kitchen genuinely cannot go wrong with you!",
    condition: (p) => Object.values(p).every((v) => v >= 5.5),
  },
  {
    id: "purist",
    label: "THE PURIST",
    emoji: "🤍",
    message:
      "Your profile is THE PURIST — you prefer clean, simple flavors and want the ingredient to speak for itself.",
    condition: (p) => Object.values(p).every((v) => v < 5.5),
  },
  {
    id: "heat_seeker",
    label: "HEAT SEEKER",
    emoji: "🔥",
    message:
      "Your profile is HEAT SEEKER — you live for the burn. The hotter the dish, the bigger your smile.",
    condition: (p) => H(p.spice) && !H(p.sweet) && !H(p.sour),
  },
  {
    id: "sweet_tooth",
    label: "SWEET TOOTH",
    emoji: "🍯",
    message:
      "Your profile is SWEET TOOTH — a hint of sweetness makes every dish better and dessert is never optional.",
    condition: (p) => H(p.sweet) && L(p.spice) && L(p.salty),
  },
  {
    id: "salt_lover",
    label: "SALT LOVER",
    emoji: "🧂",
    message:
      "Your profile is SALT LOVER — bold salty flavors are your comfort zone. Bland food simply does not cut it.",
    condition: (p) => H(p.salty) && L(p.sweet) && L(p.spice),
  },
  {
    id: "sour_power",
    label: "SOUR POWER",
    emoji: "🍋",
    message:
      "Your profile is SOUR POWER — tangy, citrusy, acidic food makes your taste buds sing.",
    condition: (p) => H(p.sour) && L(p.sweet) && L(p.spice),
  },
  {
    id: "bitter_expert",
    label: "BITTER EXPERT",
    emoji: "☕",
    message:
      "Your profile is BITTER EXPERT — dark, earthy, complex flavors are your thing. You probably love black coffee.",
    condition: (p) => H(p.bitter) && L(p.sweet),
  },
  {
    id: "umami_hunter",
    label: "UMAMI HUNTER",
    emoji: "🌿",
    message:
      "Your profile is UMAMI HUNTER — rich, deep, savory flavors are what you chase in every dish.",
    condition: (p) => H(p.umami) && L(p.sweet) && L(p.sour),
  },
  {
    id: "fiery_sweet",
    label: "FIERY SWEET",
    emoji: "🌶🍯",
    message:
      "Your profile is FIERY SWEET — heat and sweetness together is your ideal combo. Korean BBQ was made for you.",
    condition: (p) => H(p.spice) && H(p.sweet),
  },
  {
    id: "tangy_salt",
    label: "TANGY SALT",
    emoji: "🧂🍋",
    message:
      "Your profile is TANGY SALT — punchy, sharp flavors that wake the palate up immediately are your thing.",
    condition: (p) => H(p.salty) && H(p.sour),
  },
  {
    id: "bold_fire",
    label: "BOLD FIRE",
    emoji: "🔥🌿",
    message:
      "Your profile is BOLD FIRE — rich, deep, savory heat is your ideal combination. Ramen and curries are your love language.",
    condition: (p) => H(p.spice) && H(p.umami),
  },
  {
    id: "sweet_tangy",
    label: "SWEET & TANGY",
    emoji: "🍯🍋",
    message:
      "Your profile is SWEET & TANGY — you love the playful balance between sweetness and acidity. Tamarind chutney, always.",
    condition: (p) => H(p.sweet) && H(p.sour),
  },
  {
    id: "savory_depth",
    label: "SAVORY DEPTH",
    emoji: "🧂🌿",
    message:
      "Your profile is SAVORY DEPTH — bold salty umami combos are your comfort zone. Extra soy sauce on everything.",
    condition: (p) => H(p.salty) && H(p.umami),
  },
  {
    id: "complex_palate",
    label: "COMPLEX PALATE",
    emoji: "☕🌿",
    message:
      "Your profile is COMPLEX PALATE — sophisticated, layered flavors that most people take time to appreciate.",
    condition: (p) => H(p.bitter) && H(p.umami),
  },
  {
    id: "chaos_palate",
    label: "CHAOS PALATE",
    emoji: "🌪️",
    message:
      "Your profile is CHAOS PALATE — bold across the board. You love intensity and nothing is ever too much!",
    condition: (p) => H(p.spice) && H(p.salty) && H(p.sour),
  },
  {
    id: "comfort_seeker",
    label: "COMFORT SEEKER",
    emoji: "🤗",
    message:
      "Your profile is COMFORT SEEKER — sweet, salty, and rich umami is your holy trinity. You eat with your heart.",
    condition: (p) => H(p.sweet) && H(p.salty) && H(p.umami),
  },
  {
    id: "adventurer",
    label: "FLAVOR ADVENTURER",
    emoji: "🧭",
    message:
      "Your profile is FLAVOR ADVENTURER — unusual dimensions, always open to something new. The menu is your playground.",
    condition: (p) => H(p.bitter) && H(p.sour) && H(p.spice),
  },
  {
    id: "still_learning",
    label: "STILL DISCOVERING",
    emoji: "🔍",
    message:
      "Your profile is STILL DISCOVERING — give us a few more visits and we will nail your palate. Keep tasting!",
    condition: () => true, // fallback — always matches last
  },
];

export function classifyProfile(p: FlavorProfile): TasteCategory {
  const category = CATEGORIES.find((c) => c.condition(p));
  // Non-null assertion is safe because last category always matches
  return {
    id: category!.id,
    label: category!.label,
    emoji: category!.emoji,
    message: category!.message,
  };
}
