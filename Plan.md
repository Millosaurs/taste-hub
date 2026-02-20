# 🍽️ Digital Taste Management System — AI Agent Build Guide
> Exact phase-by-phase instructions. Read the entire document before writing a single line of code.

---

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Postgres + Realtime)
- **Tailwind CSS** (custom design tokens)
- **Zustand** (multi-step form state)
- **Recharts** (dashboard charts)

## Ground Rules
- Complete every checkpoint before moving to the next phase
- No `any` types — TypeScript strictly enforced
- All Supabase calls live only inside `src/lib/queries/`
- All env vars go in `.env.local`, never hardcoded
- Run `npm run build` at the end of every phase — fix errors before continuing

---

## Phase 0 — Project Scaffold

**Goal:** Clean running project with correct folder structure.

### 0.1 Bootstrap
```bash
npx create-next-app@latest taste-hub \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*"
cd taste-hub
npm install @supabase/supabase-js @supabase/ssr zustand recharts
npm install qrcode.react
npm install -D @types/node
```

### 0.2 Folder Structure
Create every folder and empty file before writing any logic:
```
src/
  app/
    feedback/
      page.tsx              ← PUBLIC: the feedback form (step flow)
    dashboard/
      page.tsx              ← STAFF: all users table + profile modals
    layout.tsx
    globals.css
  components/
    feedback/
      StepPhone.tsx         ← Step 1: enter mobile number
      StepName.tsx          ← Step 1b: name entry modal (new users only)
      StepTasteButtons.tsx  ← Step 2: taste button selections
      StepResult.tsx        ← Step 3: show computed profile to user
    dashboard/
      UsersTable.tsx        ← Table of all users
      ProfileModal.tsx      ← Modal: full taste profile for one user
      FlavorBars.tsx        ← Visual flavor dimension bars
      CategoryBadge.tsx     ← Profile category pill/badge
    ui/
      Button.tsx
      Input.tsx
      Modal.tsx
      ProgressBar.tsx
      Badge.tsx
  lib/
    supabase/
      client.ts
      server.ts
    algo/
      adjustProfile.ts
      classifyProfile.ts
      seedProfile.ts
    queries/
      users.ts
      feedback.ts
      profiles.ts
      dishes.ts
    types.ts
  store/
    feedbackStore.ts
```

### Checkpoint 0 ✓
- `npm run dev` runs without errors at `localhost:3000`
- All folders and placeholder files exist

---

## Phase 1 — Supabase Schema

**Goal:** All tables created, typed, and Realtime enabled.

### 1.1 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### 1.2 SQL — Run in Supabase SQL Editor in this exact order

```sql
-- 1. Users — phone is primary key
CREATE TABLE users (
  phone_number   TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  taste_tags     TEXT[] DEFAULT '{}',
  visit_count    INT DEFAULT 0,
  first_seen_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Dishes — kitchen managed
CREATE TABLE dishes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  flavor_tags    TEXT[] DEFAULT '{}',
  active         BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Feedback entries — one row per user per dish interaction
CREATE TABLE feedback_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number     TEXT REFERENCES users(phone_number),
  dish_id          UUID REFERENCES dishes(id),
  -- Taste button selections (all nullable — user picks what applies)
  liked_overall    BOOLEAN,
  spice_rating     TEXT CHECK (spice_rating IN ('too_mild','just_right','too_hot')),
  sweet_rating     TEXT CHECK (sweet_rating IN ('not_sweet','just_right','too_sweet')),
  salt_rating      TEXT CHECK (salt_rating IN ('bland','just_right','too_salty')),
  texture_rating   TEXT CHECK (texture_rating IN ('bad','okay','great')),
  would_order_again BOOLEAN,
  vibe_score       INT CHECK (vibe_score BETWEEN 0 AND 100),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Taste profiles — computed, one per user
CREATE TABLE taste_profiles (
  phone_number    TEXT PRIMARY KEY REFERENCES users(phone_number),
  -- Flavor dimension scores 0.0–10.0
  spice           FLOAT DEFAULT 5.0,
  sweet           FLOAT DEFAULT 5.0,
  salty           FLOAT DEFAULT 5.0,
  sour            FLOAT DEFAULT 5.0,
  bitter          FLOAT DEFAULT 5.0,
  umami           FLOAT DEFAULT 5.0,
  -- Computed category
  category_id     TEXT DEFAULT 'still_learning',
  category_label  TEXT DEFAULT 'STILL DISCOVERING',
  category_emoji  TEXT DEFAULT '🔍',
  category_message TEXT DEFAULT 'Keep giving feedback — we are learning your palate!',
  avg_vibe        FLOAT DEFAULT 0,
  confidence      FLOAT DEFAULT 0,
  last_updated    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE taste_profiles;
```

### 1.3 Seed a Test Dish
```sql
INSERT INTO dishes (name, flavor_tags) VALUES
  ('Signature Butter Chicken', ARRAY['spice','sweet','umami']),
  ('Crispy Salt & Pepper Tofu', ARRAY['salty','umami','bitter']),
  ('Mango Sorbet', ARRAY['sweet','sour']);
```

### 1.4 Supabase Clients

**`src/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**`src/lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
}
```

### 1.5 All Shared Types — `src/lib/types.ts`
```typescript
export type FlavorProfile = {
  spice: number
  sweet: number
  salty: number
  sour: number
  bitter: number
  umami: number
}

export type TasteTag = 'purist' | 'heat' | 'citrus' | 'sweet' | 'herby' | 'savory'

export type User = {
  phone_number: string
  name: string
  taste_tags: TasteTag[]
  visit_count: number
  first_seen_at: string
}

export type FeedbackEntry = {
  id: string
  phone_number: string
  dish_id: string
  liked_overall: boolean | null
  spice_rating: 'too_mild' | 'just_right' | 'too_hot' | null
  sweet_rating: 'not_sweet' | 'just_right' | 'too_sweet' | null
  salt_rating: 'bland' | 'just_right' | 'too_salty' | null
  texture_rating: 'bad' | 'okay' | 'great' | null
  would_order_again: boolean | null
  vibe_score: number
  created_at: string
}

export type TasteCategory = {
  id: string
  label: string
  emoji: string
  message: string
}

export type TasteProfile = FlavorProfile & TasteCategory & {
  phone_number: string
  avg_vibe: number
  confidence: number
  last_updated: string
}

export type Dish = {
  id: string
  name: string
  flavor_tags: string[]
  active: boolean
  created_at: string
}
```

### Checkpoint 1 ✓
- All 4 tables visible in Supabase table editor
- Realtime enabled
- Both clients export without errors
- `types.ts` compiles cleanly

---

## Phase 2 — The Taste Algorithm

**Goal:** Pure logic files, no UI. The brain of the system.

### 2.1 Seed from Self-Declared Tags — `src/lib/algo/seedProfile.ts`
```typescript
import { FlavorProfile, TasteTag } from '@/lib/types'

const TAG_SEEDS: Record<TasteTag, Partial<FlavorProfile>> = {
  purist:  { spice: -1.5, sweet: -1.0, salty: -0.5, bitter: -0.5 },
  heat:    { spice: 2.5 },
  citrus:  { sour: 2.0, sweet: 0.5 },
  sweet:   { sweet: 2.5, sour: 0.5 },
  herby:   { umami: 1.5, bitter: 0.8 },
  savory:  { umami: 2.0, salty: 1.5 },
}

const BASE: FlavorProfile = {
  spice: 5.0, sweet: 5.0, salty: 5.0,
  sour: 5.0,  bitter: 5.0, umami: 5.0
}

export function seedProfileFromTags(tags: TasteTag[]): FlavorProfile {
  const p = { ...BASE }
  tags.forEach(tag => {
    Object.entries(TAG_SEEDS[tag] ?? {}).forEach(([k, delta]) => {
      const key = k as keyof FlavorProfile
      p[key] = Math.min(10, Math.max(0, p[key] + (delta ?? 0)))
    })
  })
  return p
}
```

### 2.2 Adjust Profile from Feedback — `src/lib/algo/adjustProfile.ts`
```typescript
import { FlavorProfile, FeedbackEntry, Dish } from '@/lib/types'

// How much each button choice nudges the relevant score
const SPICE_MAP   = { too_mild: -2.0, just_right: 0,  too_hot: +2.0 }
const SWEET_MAP   = { not_sweet: -1.5, just_right: 0, too_sweet: +1.5 }
const SALT_MAP    = { bland: -1.5,    just_right: 0,  too_salty: +1.5 }

const NUDGE_BASE  = 1.2
const DECAY_RATE  = 0.85   // nudges get smaller as visit count grows

function nudgeToward(current: number, target: number, amount: number): number {
  const diff = target - current
  return current + Math.sign(diff) * Math.min(Math.abs(diff), amount)
}

function clamp(v: number): number {
  return Math.min(10, Math.max(0, v))
}

export function adjustProfile(
  current: FlavorProfile,
  feedback: FeedbackEntry,
  dish: Dish,
  visitCount: number
): FlavorProfile {
  const p = { ...current }
  const nudge = NUDGE_BASE * Math.pow(DECAY_RATE, Math.max(0, visitCount - 1))

  // Direct button adjustments
  if (feedback.spice_rating && feedback.spice_rating !== 'just_right') {
    const delta = SPICE_MAP[feedback.spice_rating]
    p.spice = clamp(p.spice + delta * (nudge / NUDGE_BASE))
  }
  if (feedback.sweet_rating && feedback.sweet_rating !== 'just_right') {
    const delta = SWEET_MAP[feedback.sweet_rating]
    p.sweet = clamp(p.sweet + delta * (nudge / NUDGE_BASE))
  }
  if (feedback.salt_rating && feedback.salt_rating !== 'just_right') {
    const delta = SALT_MAP[feedback.salt_rating]
    p.salty = clamp(p.salty + delta * (nudge / NUDGE_BASE))
  }

  // Overall like/dislike nudges dish flavor tags
  const vibeDir = feedback.liked_overall === true ? 1 : feedback.liked_overall === false ? -1 : 0
  if (vibeDir !== 0) {
    dish.flavor_tags.forEach(tag => {
      if (tag in p) {
        const k = tag as keyof FlavorProfile
        p[k] = nudgeToward(p[k], vibeDir > 0 ? 10 : 0, nudge * 0.5)
      }
    })
  }

  // Would order again = strong positive signal across all dish tags
  if (feedback.would_order_again === true) {
    dish.flavor_tags.forEach(tag => {
      if (tag in p) p[tag as keyof FlavorProfile] = clamp(p[tag as keyof FlavorProfile] + nudge * 0.4)
    })
  }

  return p
}

export function computeAvgVibe(entries: FeedbackEntry[]): number {
  if (!entries.length) return 0
  return Math.round(entries.reduce((s, e) => s + e.vibe_score, 0) / entries.length)
}

export function computeConfidence(visitCount: number): number {
  return Math.min(visitCount / 8, 1.0)
}
```

### 2.3 Classify Profile — `src/lib/algo/classifyProfile.ts`
```typescript
import { FlavorProfile, TasteCategory } from '@/lib/types'

const H = (v: number) => v >= 6.5
const L = (v: number) => v < 3.5

const CATEGORIES: Array<TasteCategory & { condition: (p: FlavorProfile) => boolean }> = [
  {
    id: 'all_rounder', label: 'ALL ROUNDER', emoji: '🌈',
    message: "Your profile is categorised under ALL ROUNDER — you like everything and the kitchen genuinely cannot go wrong with you!",
    condition: p => Object.values(p).every(v => v >= 5.5)
  },
  {
    id: 'purist', label: 'THE PURIST', emoji: '🤍',
    message: "Your profile is THE PURIST — you prefer clean, simple flavors and want the ingredient to speak for itself.",
    condition: p => Object.values(p).every(v => v < 5.5)
  },
  {
    id: 'heat_seeker', label: 'HEAT SEEKER', emoji: '🔥',
    message: "Your profile is HEAT SEEKER — you live for the burn. The hotter the dish, the bigger your smile.",
    condition: p => H(p.spice) && !H(p.sweet) && !H(p.sour)
  },
  {
    id: 'sweet_tooth', label: 'SWEET TOOTH', emoji: '🍯',
    message: "Your profile is SWEET TOOTH — a hint of sweetness makes every dish better and dessert is never optional.",
    condition: p => H(p.sweet) && L(p.spice) && L(p.salty)
  },
  {
    id: 'salt_lover', label: 'SALT LOVER', emoji: '🧂',
    message: "Your profile is SALT LOVER — bold salty flavors are your comfort zone. Bland food simply does not cut it.",
    condition: p => H(p.salty) && L(p.sweet) && L(p.spice)
  },
  {
    id: 'sour_power', label: 'SOUR POWER', emoji: '🍋',
    message: "Your profile is SOUR POWER — tangy, citrusy, acidic food makes your taste buds sing.",
    condition: p => H(p.sour) && L(p.sweet) && L(p.spice)
  },
  {
    id: 'bitter_expert', label: 'BITTER EXPERT', emoji: '☕',
    message: "Your profile is BITTER EXPERT — dark, earthy, complex flavors are your thing. You probably love black coffee.",
    condition: p => H(p.bitter) && L(p.sweet)
  },
  {
    id: 'umami_hunter', label: 'UMAMI HUNTER', emoji: '🌿',
    message: "Your profile is UMAMI HUNTER — rich, deep, savory flavors are what you chase in every dish.",
    condition: p => H(p.umami) && L(p.sweet) && L(p.sour)
  },
  {
    id: 'fiery_sweet', label: 'FIERY SWEET', emoji: '🌶🍯',
    message: "Your profile is FIERY SWEET — heat and sweetness together is your ideal combo. Korean BBQ was made for you.",
    condition: p => H(p.spice) && H(p.sweet)
  },
  {
    id: 'tangy_salt', label: 'TANGY SALT', emoji: '🧂🍋',
    message: "Your profile is TANGY SALT — punchy, sharp flavors that wake the palate up immediately are your thing.",
    condition: p => H(p.salty) && H(p.sour)
  },
  {
    id: 'bold_fire', label: 'BOLD FIRE', emoji: '🔥🌿',
    message: "Your profile is BOLD FIRE — rich, deep, savory heat is your ideal combination. Ramen and curries are your love language.",
    condition: p => H(p.spice) && H(p.umami)
  },
  {
    id: 'sweet_tangy', label: 'SWEET & TANGY', emoji: '🍯🍋',
    message: "Your profile is SWEET & TANGY — you love the playful balance between sweetness and acidity. Tamarind chutney, always.",
    condition: p => H(p.sweet) && H(p.sour)
  },
  {
    id: 'savory_depth', label: 'SAVORY DEPTH', emoji: '🧂🌿',
    message: "Your profile is SAVORY DEPTH — bold salty umami combos are your comfort zone. Extra soy sauce on everything.",
    condition: p => H(p.salty) && H(p.umami)
  },
  {
    id: 'complex_palate', label: 'COMPLEX PALATE', emoji: '☕🌿',
    message: "Your profile is COMPLEX PALATE — sophisticated, layered flavors that most people take time to appreciate.",
    condition: p => H(p.bitter) && H(p.umami)
  },
  {
    id: 'chaos_palate', label: 'CHAOS PALATE', emoji: '🌪️',
    message: "Your profile is CHAOS PALATE — bold across the board. You love intensity and nothing is ever too much!",
    condition: p => H(p.spice) && H(p.salty) && H(p.sour)
  },
  {
    id: 'comfort_seeker', label: 'COMFORT SEEKER', emoji: '🤗',
    message: "Your profile is COMFORT SEEKER — sweet, salty, and rich umami is your holy trinity. You eat with your heart.",
    condition: p => H(p.sweet) && H(p.salty) && H(p.umami)
  },
  {
    id: 'adventurer', label: 'FLAVOR ADVENTURER', emoji: '🧭',
    message: "Your profile is FLAVOR ADVENTURER — unusual dimensions, always open to something new. The menu is your playground.",
    condition: p => H(p.bitter) && H(p.sour) && H(p.spice)
  },
  {
    id: 'still_learning', label: 'STILL DISCOVERING', emoji: '🔍',
    message: "Your profile is STILL DISCOVERING — give us a few more visits and we will nail your palate. Keep tasting!",
    condition: () => true  // fallback — always matches last
  }
]

export function classifyProfile(p: FlavorProfile): TasteCategory {
  return CATEGORIES.find(c => c.condition(p))!
}
```

### Checkpoint 2 ✓
- All three algo files compile with no TypeScript errors
- Manually test: call `classifyProfile({ spice:8, sweet:8, salty:5, sour:5, bitter:5, umami:5 })` → returns `fiery_sweet`
- Call with all values 6.0 → returns `all_rounder`
- Call with all values 3.0 → returns `purist`
- Fallback with empty-ish profile → returns `still_learning`

---

## Phase 3 — Query Layer

**Goal:** All DB reads/writes go through these functions. Components never call Supabase directly.

### 3.1 `src/lib/queries/users.ts`

Implement and export these functions:

```typescript
// getUserByPhone(phone: string): Promise<User | null>
//   → SELECT from users WHERE phone_number = phone
//   → Return null if not found (do NOT throw)

// createUser(phone: string, name: string, tags: TasteTag[]): Promise<User>
//   → INSERT into users
//   → Then call createInitialProfile(phone, tags)
//   → Return the created user

// createInitialProfile(phone: string, tags: TasteTag[]): Promise<void>
//   → Call seedProfileFromTags(tags) to get starting FlavorProfile
//   → INSERT into taste_profiles with seeded values + phone_number

// incrementVisitCount(phone: string): Promise<void>
//   → UPDATE users SET visit_count = visit_count + 1 WHERE phone_number = phone
```

### 3.2 `src/lib/queries/feedback.ts`

```typescript
// submitFeedback(entry: Omit<FeedbackEntry, 'id' | 'created_at'>): Promise<FeedbackEntry>
//   → INSERT into feedback_entries
//   → After insert: call updateProfileAfterFeedback
//   → After profile update: call incrementVisitCount
//   → Return the inserted entry

// getFeedbackByPhone(phone: string): Promise<FeedbackEntry[]>
//   → SELECT all feedback_entries WHERE phone_number = phone
//   → ORDER BY created_at DESC

// updateProfileAfterFeedback(
//     phone: string,
//     feedback: FeedbackEntry,
//     dish: Dish
//   ): Promise<TasteProfile>
//   → Fetch current taste_profile for phone
//   → Fetch user visit_count
//   → Run adjustProfile(current, feedback, dish, visitCount)
//   → Run classifyProfile(updated)
//   → computeAvgVibe from all entries
//   → computeConfidence from visitCount + 1
//   → UPSERT taste_profiles with all updated fields
//   → Return the updated TasteProfile
```

### 3.3 `src/lib/queries/profiles.ts`

```typescript
// getProfile(phone: string): Promise<TasteProfile | null>
//   → SELECT from taste_profiles WHERE phone_number = phone

// getAllProfiles(): Promise<Array<TasteProfile & { users: User }>>
//   → SELECT taste_profiles.*, users.name, users.visit_count
//   → JOIN users ON taste_profiles.phone_number = users.phone_number
//   → ORDER BY users.visit_count DESC
//   → Used by dashboard to show all users
```

### 3.4 `src/lib/queries/dishes.ts`

```typescript
// getAllDishes(): Promise<Dish[]>
//   → SELECT all active dishes

// getDishById(id: string): Promise<Dish | null>
//   → SELECT single dish by id
```

### Checkpoint 3 ✓
- All query functions are typed, handle errors with try/catch
- `submitFeedback` correctly chains: insert → adjust → classify → upsert profile
- `getAllProfiles` returns joined user data

---

## Phase 4 — Zustand Store

**Goal:** Manage the multi-step feedback form state in one place.

### `src/store/feedbackStore.ts`

```typescript
import { create } from 'zustand'
import { User, TasteTag, TasteProfile, Dish } from '@/lib/types'

type SpiceRating  = 'too_mild' | 'just_right' | 'too_hot'
type SweetRating  = 'not_sweet' | 'just_right' | 'too_sweet'
type SaltRating   = 'bland' | 'just_right' | 'too_salty'
type TextureRating = 'bad' | 'okay' | 'great'

// Steps in order:
// 'phone' → 'register' (new users) OR 'taste' (returning) → 'result'
type Step = 'phone' | 'register' | 'taste' | 'result'

type FeedbackStore = {
  step: Step
  setStep: (s: Step) => void

  // Identity
  phoneNumber: string
  setPhoneNumber: (p: string) => void
  user: User | null
  setUser: (u: User | null) => void
  isReturning: boolean
  setIsReturning: (v: boolean) => void

  // Registration (new users)
  name: string
  setName: (n: string) => void
  selectedTags: TasteTag[]
  toggleTag: (t: TasteTag) => void   // max 3

  // Active dish context
  activeDish: Dish | null
  setActiveDish: (d: Dish) => void

  // Taste selections (Step 2 buttons)
  likedOverall: boolean | null
  setLikedOverall: (v: boolean) => void
  spiceRating: SpiceRating | null
  setSpiceRating: (v: SpiceRating) => void
  sweetRating: SweetRating | null
  setSweetRating: (v: SweetRating) => void
  saltRating: SaltRating | null
  setSaltRating: (v: SaltRating) => void
  textureRating: TextureRating | null
  setTextureRating: (v: TextureRating) => void
  wouldOrderAgain: boolean | null
  setWouldOrderAgain: (v: boolean) => void
  vibeScore: number
  setVibeScore: (v: number) => void

  // Result
  updatedProfile: TasteProfile | null
  setUpdatedProfile: (p: TasteProfile) => void

  reset: () => void
}
```

**Rules for `toggleTag`:** if tag already selected, deselect it. If not selected and count < 3, add it. If count is already 3, do nothing.

**`reset`** must return every field to its initial value — call this after the result is shown and user taps "Done".

### Checkpoint 4 ✓
- Store compiles with no TypeScript errors
- `toggleTag` enforces 3 tag maximum
- `reset` clears all fields

---

## Phase 5 — Feedback Form (Public Flow)

**Goal:** The full user-facing experience. This is what diners interact with.

The entire flow lives at `/feedback` and is controlled by `step` in the Zustand store.

```
/feedback
  step = 'phone'    → StepPhone renders
  step = 'register' → StepName renders (modal over phone step)
  step = 'taste'    → StepTasteButtons renders
  step = 'result'   → StepResult renders
```

---

### 5.1 `StepPhone.tsx` — Step 1: Mobile Number Entry

**Layout:**
```
[ TASTE HUB logo/wordmark ]

  "What's your number?"
  [ +91  ___ ___ ____ ]  ← large input, number keyboard
  [ CONTINUE → ]
```

**Logic:**
1. Validate: must be exactly 10 digits after stripping country code
2. On submit: call `getUserByPhone(phone)`
3. **If user found (returning):**
   - `setUser(found)`, `setIsReturning(true)`
   - Show a brief welcome flash: `"Welcome back, {name}! 👋"` for 1.5s
   - Then `setStep('taste')`
4. **If user not found (new):**
   - `setIsReturning(false)`
   - `setStep('register')` — this renders StepName as a modal overlay

**UI Details:**
- Phone input: large font (text-4xl), center-aligned
- Show loading spinner on the button while checking
- Error state if phone is invalid format

---

### 5.2 `StepName.tsx` — Step 1b: Registration Modal (New Users Only)

This appears as a **bottom-sheet modal** sliding up over the phone step.

**Layout:**
```
┌─────────────────────────────┐
│  "Let's get you set up"     │
│                             │
│  Your first name            │
│  [ __________________ ]     │
│                             │
│  What describes you?        │
│  (pick up to 3)             │
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │🤍    │ │🌶    │ │🍋    ││
│  │Purist│ │Heat  │ │Citrus││
│  └──────┘ └──────┘ └──────┘│
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │🍯    │ │🌿    │ │🧄    ││
│  │Sweet │ │Herby │ │Savory││
│  └──────┘ └──────┘ └──────┘│
│                             │
│      [ LET'S GO →  ]        │
└─────────────────────────────┘
```

**The 6 Tags:**
| Tag Key | Emoji | Label |
|---------|-------|-------|
| `purist` | 🤍 | The Purist |
| `heat` | 🌶 | Heat Seeker |
| `citrus` | 🍋 | Citrus & Bright |
| `sweet` | 🍯 | Sweet Tooth |
| `herby` | 🌿 | Herby & Earthy |
| `savory` | 🧄 | Bold & Savory |

**Logic:**
1. Validate: name 2–40 chars, at least 1 tag selected
2. On submit: call `createUser(phone, name, tags)` — this also seeds the taste profile
3. `setUser(created)`, `setStep('taste')`

**UI Details:**
- Tag buttons: toggle selected/unselected state visually (filled accent vs dim)
- If 3 already selected, unselected buttons are greyed out but not disabled (allow swapping)
- Slide-up animation on mount

---

### 5.3 `StepTasteButtons.tsx` — Step 2: Taste Feedback

**Layout — sections stacked vertically, each is a card:**

```
"How was the [Dish Name]?"
{isReturning && "We know you love [category_label] — let's refine your profile!"}

┌─ OVERALL ─────────────────┐
│  [ 😍 Loved it ] [ 😐 Meh ] [ 😞 Didn't like ]  │
└───────────────────────────┘

┌─ SPICE ────────────────────┐
│  [ 🥶 Too Mild ] [ ✅ Just Right ] [ 🔥 Too Hot ] │
└───────────────────────────┘

┌─ SWEETNESS ────────────────┐
│  [ Not Sweet ] [ Just Right ] [ Too Sweet ]       │
└───────────────────────────┘

┌─ SALT ─────────────────────┐
│  [ Bland ] [ Just Right ] [ Too Salty ]           │
└───────────────────────────┘

┌─ TEXTURE ──────────────────┐
│  [ 👎 Bad ] [ 👍 Okay ] [ 🙌 Great ]             │
└───────────────────────────┘

┌─ WOULD YOU ORDER AGAIN? ───┐
│         [ YES ] [ NO ]                            │
└───────────────────────────┘

[ SUBMIT FEEDBACK ]
```

**Logic:**
- Each row: single select, one button active at a time per row
- No row is mandatory except "Overall" — others can be skipped
- "Submit" button is disabled until `likedOverall` is set
- On submit:
  1. Call `submitFeedback({...all selections, phone_number, dish_id})`
  2. This triggers the chain: insert → adjust profile → classify → upsert
  3. Get back the `updatedProfile`
  4. `setUpdatedProfile(profile)`, `setStep('result')`
- Show loading state on submit button during processing

**UI Details:**
- Each button row: 3 buttons full-width grid
- Active button: filled accent color with press shadow gone (sunken look)
- Inactive buttons: dim border, normal elevation

---

### 5.4 `StepResult.tsx` — Step 3: Profile Result

**Layout:**
```
┌─────────────────────────────┐
│  Thanks, {name}! 🎉         │
│                             │
│         🔥🌿               │
│      BOLD FIRE              │
│                             │
│  "Rich, deep, savory heat   │
│   is your ideal combo..."   │
│                             │
│  YOUR FLAVOR DNA            │
│  Spice  ████████░░  8.2     │
│  Sweet  ████░░░░░░  3.8     │
│  Salty  █████░░░░░  5.1     │
│  Sour   ██░░░░░░░░  2.3     │
│  Bitter ███░░░░░░░  3.0     │
│  Umami  ███████░░░  7.1     │
│                             │
│  Confidence                 │
│  ████░░░░░░  Visit 4 of 8   │
│                             │
│       [ DONE ]              │
└─────────────────────────────┘
```

**Logic:**
- Bars animate on mount (width transitions from 0 to final value)
- Confidence bar: `confidence * 100%` width, label shows `Visit {visitCount} of 8`
- "Done" button: calls `reset()` on the store, redirects back to `step = 'phone'`

**UI Details:**
- Emoji large (text-6xl), centered
- Category label all-caps, bold, large
- Message in a distinct card below label
- Each flavor bar: label left, filled bar center, score value right

### Checkpoint 5 ✓
- Full flow works end-to-end on mobile viewport (375px)
- New user: phone → register modal → taste buttons → result card
- Returning user: phone → welcome flash → taste buttons → result card
- Profile in Supabase updates after each submission
- Category label changes as profile shifts across visits

---

## Phase 6 — Dashboard (Staff-Facing)

**Goal:** All users visible in a table, clicking any row opens a full profile modal.

### 6.1 `/dashboard/page.tsx` (Server Component)

Fetch all profiles server-side on page load:
```typescript
// Fetch: getAllProfiles() — joined with user name + visit_count
// Render: page header + <UsersTable profiles={profiles} />
// No auth for MVP — add a simple env-var password gate if needed
```

**Page Layout:**
```
TASTE HUB DASHBOARD

[ Search by name or phone... ]

┌────────────────────────────────────────────────────────────┐
│ NAME       PHONE         PROFILE         VISITS  VIBE  │
├────────────────────────────────────────────────────────────┤
│ Priya M.   +91 98XXX   🔥🌿 BOLD FIRE    6      81%   │
│ Rahul K.   +91 77XXX   🌈 ALL ROUNDER   12      94%   │
│ Sneha R.   +91 90XXX   🔍 DISCOVERING    1      60%   │
└────────────────────────────────────────────────────────────┘
```

Clicking any row opens `<ProfileModal>` for that user.

---

### 6.2 `UsersTable.tsx`

- Client component (needs `useState` for search and selected user)
- Search: filter by name or phone number in real-time (client-side, no DB call)
- Columns: Name, Phone (masked: show last 4 only), Category badge + emoji, Visit count, Avg vibe as `%`
- Row click: `setSelectedUser(profile)` → modal opens
- Sort by visit count descending by default

---

### 6.3 `ProfileModal.tsx`

Appears as a centered modal with dark overlay backdrop.

**Modal Layout:**
```
┌────────────────────────────────────┐
│  [×]                               │
│                                    │
│  Priya M.                          │
│  +91 98XXX XXXXX  •  6 visits      │
│                                    │
│       🔥🌿                         │
│    BOLD FIRE                       │
│                                    │
│  "Rich, deep, savory heat is your  │
│   ideal combo. Ramen and curries   │
│   are your love language."         │
│                                    │
│  FLAVOR DNA                        │
│  Spice  ████████░░  8.2            │
│  Sweet  ████░░░░░░  3.8            │
│  Salty  █████░░░░░  5.1            │
│  Sour   ██░░░░░░░░  2.3            │
│  Bitter ███░░░░░░░  3.0            │
│  Umami  ███████░░░  7.1            │
│                                    │
│  Confidence  ████████░░  75%       │
│  Last visit: 2 days ago            │
│                                    │
│  Self-declared: 🌶 Heat  🧄 Savory │
└────────────────────────────────────┘
```

**Logic:**
- Close on: `×` button, backdrop click, or Escape key
- `FlavorBars` component handles the animated bars (reuse from StepResult)
- Confidence bar: show percentage + "Established" if > 75%, "Building" if 40–75%, "New" if < 40%
- Self-declared tags shown as small badge pills at the bottom

---

### 6.4 `FlavorBars.tsx` (Shared Component)

Used in both `StepResult` and `ProfileModal`. Props:

```typescript
type FlavorBarsProps = {
  profile: FlavorProfile
  animated?: boolean  // default true
}
```

Render 6 bars in this order: Spice, Sweet, Salty, Sour, Bitter, Umami.

Each bar:
- Label (left, fixed width)
- Bar track (dark background, rounded)
- Bar fill (accent color, width = `(score/10) * 100%`)
- Score value (right, monospace)

Animate: on mount, bar fills from 0 to final width over 600ms with staggered delay (each bar 80ms after the previous).

---

### 6.5 `CategoryBadge.tsx` (Shared Component)

```typescript
type CategoryBadgeProps = {
  emoji: string
  label: string
  size?: 'sm' | 'md' | 'lg'
}
```

Renders a pill with emoji + label. Used in both the table row and the modal.

### Checkpoint 6 ✓
- Dashboard loads all users from Supabase
- Search filters correctly client-side
- Clicking a row opens the modal with that user's data
- Modal closes on backdrop click and Escape key
- FlavorBars animate on modal open
- All works on desktop viewport (1024px+)

---

## Phase 7 — Design System

**Goal:** Apply the neo-brutalist design system consistently. Do this pass AFTER all features work.

### 7.1 Tailwind Config — `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base:    '#0A0A0A',
        surface: '#141414',
        raised:  '#1E1E1E',
        border:  '#2A2A2A',
        text: {
          primary:   '#F0F0F0',
          secondary: '#808080',
          muted:     '#404040',
        },
        accent: {
          yellow: '#E8FF47',   // PRIMARY — buttons, active states, highlights
          red:    '#FF4444',   // hot/error/danger
          green:  '#44FF88',   // mild/success/confirm
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        brutal: '14px',
        brutalLg: '20px',
        brutalXl: '28px',
      },
      boxShadow: {
        brutal:       '4px 4px 0px #000000',
        brutalSm:     '2px 2px 0px #000000',
        brutalHover:  '5px 5px 0px #000000',
        brutalActive: '0px 0px 0px #000000',
        glow:         '0 0 24px rgba(232, 255, 71, 0.25)',
        glowRed:      '0 0 24px rgba(255, 68, 68, 0.25)',
        glowGreen:    '0 0 24px rgba(68, 255, 136, 0.25)',
      }
    }
  },
  plugins: []
}
export default config
```

### 7.2 Button Component — `src/components/ui/Button.tsx`

Three variants. The press effect is non-negotiable on all of them:

```typescript
// variant: 'primary'  → accent yellow fill, black text, brutal shadow
// variant: 'ghost'    → transparent, border, white text, brutal shadow  
// variant: 'danger'   → accent red fill, white text, red glow shadow

// Press behavior (apply via Tailwind active: variants):
// Default: shadow-brutal, translateY-0
// Hover:   shadow-brutalHover, translateY(-1px) → lifts slightly  
// Active:  shadow-brutalActive, translateY(3px) → sunken press feel

// Apply these Tailwind classes to every button:
// "transition-all duration-75 active:translate-y-[3px] active:shadow-brutalActive
//  hover:-translate-y-[1px] hover:shadow-brutalHover shadow-brutal"
```

### 7.3 Global Styles — `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #0A0A0A;
    color: #F0F0F0;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Scrollbar — dark themed */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #141414; }
  ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
}

@layer components {
  /* Reusable press effect — add class="btn-press" to any interactive element */
  .btn-press {
    @apply transition-all duration-75 shadow-brutal
           hover:-translate-y-px hover:shadow-brutalHover
           active:translate-y-[3px] active:shadow-brutalActive;
  }

  /* Card surface */
  .card {
    @apply bg-surface border border-border rounded-brutal p-5;
  }

  /* Section heading */
  .section-label {
    @apply text-xs font-mono uppercase tracking-widest text-text-secondary mb-3;
  }
}
```

### 7.4 Design Rules — Apply Uniformly

Go through every component and verify:

- **Background:** `bg-base` (#0A0A0A) for page, `bg-surface` for cards, `bg-raised` for nested elements
- **Borders:** always `border-border` (#2A2A2A), 1px
- **Border radius:** `rounded-brutal` (14px) for cards and buttons, `rounded-full` only for pills/badges
- **Accent color:** `accent-yellow` used on ONE dominant element per screen (primary CTA or active state). Never as background of large areas.
- **Text:** `text-primary` for headings, `text-secondary` for labels, `font-mono` for all numbers and phone numbers
- **Shadows:** all interactive elements use brutal shadow system — no `drop-shadow` or `blur` shadows except glow on active states
- **Spacing:** consistent 20px (`p-5`) for card padding, 12px (`gap-3`) for button grids

### Checkpoint 7 ✓
- No hardcoded color hex values in component files (use Tailwind tokens only)
- All buttons have visible press effect on click
- Accent yellow appears on max 2 elements per screen
- Monochromatic base with no random color deviations
- Mobile and desktop both look consistent

---

## Phase 8 — End-to-End Test

**Goal:** Simulate a real service session from start to finish.

### Test Scenario A — New User
1. Open `/feedback` on a mobile viewport
2. Enter a phone number not in the DB
3. Modal appears → enter name "Arjun", select tags: Heat + Savory
4. Taste buttons screen: select "Loved it", spice = "Too Hot", would order again = No
5. Submit → result card shows (category should reflect spice reduction signal)
6. Open `/dashboard` → Arjun appears in the table
7. Click Arjun's row → modal opens with correct flavor bars

### Test Scenario B — Returning User
1. Re-enter Arjun's phone number
2. Welcome flash appears with his name
3. Skip directly to taste buttons
4. Submit different selections (spice = "Just Right" this time)
5. Result card shows updated profile
6. Confidence bar should be higher (visit 2 of 8)

### Test Scenario C — Category Shift
1. Submit 4+ feedbacks for the same phone with "Loved it" + "Too Sweet" each time
2. After ~4 submissions, category should shift toward `sweet_tooth` or similar
3. Verify in dashboard modal that flavor bars visually reflect the shift

### Full Checklist
- [ ] New user creates row in `users` AND `taste_profiles`
- [ ] `feedback_entries` row created per submission
- [ ] `taste_profiles` updates after every submission
- [ ] Category label changes as profile evolves
- [ ] Returning user skips registration
- [ ] Dashboard table search works
- [ ] Modal opens and closes correctly
- [ ] FlavorBars animate on every modal open
- [ ] `reset()` clears store so next user can start fresh

---

## Phase 9 — Production Hardening

**Goal:** Stable, deployable, and secure.

### 9.1 Input Validation
- Phone: strip all non-digits, must be 10 digits, show inline error if not
- Name: trim whitespace, 2–40 chars, letters/spaces/hyphens only
- All Supabase inputs sanitized before insert

### 9.2 Error States
Every async call must have three UI states: loading, success, error.
- Loading: button shows spinner, is disabled
- Error: red inline message below the input or button, never a full-page crash
- Network failure: "Something went wrong. Try again." with retry button

### 9.3 Build and Deploy
```bash
npm run build       # Fix every TypeScript and ESLint error before continuing
vercel deploy       # Add all env vars in Vercel project settings
```

### 9.4 Row Level Security (Supabase)
```sql
-- Enable RLS on all tables
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE taste_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes           ENABLE ROW LEVEL SECURITY;

-- Public can insert feedback and users (needed for feedback form)
CREATE POLICY "Public insert users"    ON users            FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert feedback" ON feedback_entries FOR INSERT WITH CHECK (true);

-- Public can read dishes (needed to show dish name in feedback form)
CREATE POLICY "Public read dishes"     ON dishes           FOR SELECT USING (active = true);

-- Profiles readable by anyone (for result card) — tighten in v2 with auth
CREATE POLICY "Public read profiles"   ON taste_profiles   FOR SELECT USING (true);
CREATE POLICY "Public upsert profiles" ON taste_profiles   FOR ALL    WITH CHECK (true);
```

### Final Checklist
- [ ] `npm run build` passes with zero errors and zero warnings
- [ ] No `console.log` statements in production code
- [ ] Mobile layout correct at 375px, 390px, 414px
- [ ] `.env.local` is in `.gitignore`
- [ ] RLS enabled on all tables
- [ ] Vercel deployment live and accessible

---

## Summary

| Phase | Deliverable |
|-------|-------------|
| 0 | Project scaffold + folder structure |
| 1 | Supabase schema + clients + types |
| 2 | Adjust algo + classifier + seed function |
| 3 | Full DB query layer |
| 4 | Zustand multi-step store |
| 5 | Feedback form: phone → register → taste → result |
| 6 | Dashboard: users table + profile modal |
| 7 | Neo-brutalist design system pass |
| 8 | End-to-end test scenarios |
| 9 | Production hardening + deploy |
