import type { Dish, TasteProfile, TasteTag, User } from "@idt-shit/db";
import { create } from "zustand";

type SpiceRating = "too_mild" | "just_right" | "too_hot";
type SweetRating = "not_sweet" | "just_right" | "too_sweet";
type SaltRating = "bland" | "just_right" | "too_salty";
type TextureRating = "bad" | "okay" | "great";

// Steps in order:
// 'phone' → 'register' (new users) → 'dish' → 'taste' → 'result'
// OR 'phone' → 'profile' (returning users) → 'dish' → 'taste' → 'result'
type Step = "phone" | "register" | "profile" | "dish" | "taste" | "result";

type FeedbackStore = {
  step: Step;
  setStep: (s: Step) => void;

  // Identity
  phoneNumber: string;
  setPhoneNumber: (p: string) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  isReturning: boolean;
  setIsReturning: (v: boolean) => void;

  // Registration (new users)
  name: string;
  setName: (n: string) => void;
  selectedTags: TasteTag[];
  toggleTag: (t: TasteTag) => void; // max 3

  // Active dish context (multiple selection)
  selectedDishes: Dish[];
  toggleDish: (d: Dish) => void;
  clearDishes: () => void;

  // Taste selections (Step 2 buttons)
  likedOverall: boolean | null;
  setLikedOverall: (v: boolean | null) => void;
  spiceRating: SpiceRating | null;
  setSpiceRating: (v: SpiceRating | null) => void;
  sweetRating: SweetRating | null;
  setSweetRating: (v: SweetRating | null) => void;
  saltRating: SaltRating | null;
  setSaltRating: (v: SaltRating | null) => void;
  textureRating: TextureRating | null;
  setTextureRating: (v: TextureRating | null) => void;
  wouldOrderAgain: boolean | null;
  setWouldOrderAgain: (v: boolean | null) => void;
  vibeScore: number;
  setVibeScore: (v: number) => void;

  // Result
  updatedProfile: TasteProfile | null;
  setUpdatedProfile: (p: TasteProfile | null) => void;

  reset: () => void;
};

const initialState = {
  step: "phone" as Step,
  phoneNumber: "",
  user: null,
  isReturning: false,
  name: "",
  selectedTags: [] as TasteTag[],
  selectedDishes: [] as Dish[],
  likedOverall: null,
  spiceRating: null,
  sweetRating: null,
  saltRating: null,
  textureRating: null,
  wouldOrderAgain: null,
  vibeScore: 50,
  updatedProfile: null,
};

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setUser: (user) => set({ user }),
  setIsReturning: (isReturning) => set({ isReturning }),
  setName: (name) => set({ name }),

  // Toggle tag: if already selected, deselect. If not selected and count < 3, add it.
  toggleTag: (tag) =>
    set((state) => {
      if (state.selectedTags.includes(tag)) {
        return { selectedTags: state.selectedTags.filter((t) => t !== tag) };
      }
      if (state.selectedTags.length < 3) {
        return { selectedTags: [...state.selectedTags, tag] };
      }
      // If count is already 3, do nothing
      return state;
    }),

  // Toggle dish selection
  toggleDish: (dish) =>
    set((state) => {
      const isSelected = state.selectedDishes.some((d) => d.id === dish.id);
      if (isSelected) {
        return { selectedDishes: state.selectedDishes.filter((d) => d.id !== dish.id) };
      }
      return { selectedDishes: [...state.selectedDishes, dish] };
    }),
  clearDishes: () => set({ selectedDishes: [] }),
  setLikedOverall: (likedOverall) => set({ likedOverall }),
  setSpiceRating: (spiceRating) => set({ spiceRating }),
  setSweetRating: (sweetRating) => set({ sweetRating }),
  setSaltRating: (saltRating) => set({ saltRating }),
  setTextureRating: (textureRating) => set({ textureRating }),
  setWouldOrderAgain: (wouldOrderAgain) => set({ wouldOrderAgain }),
  setVibeScore: (vibeScore) => set({ vibeScore }),
  setUpdatedProfile: (updatedProfile) => set({ updatedProfile }),

  reset: () => set(initialState),
}));
