"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useFeedbackStore } from "@/store/feedbackStore";
import { client } from "@/utils/orpc";
import { cn } from "@/lib/utils";
import {
  Heart,
  HeartCrack,
  Snowflake,
  Check,
  Flame,
  Minus,
  Candy,
  CircleDot,
  ThumbsDown,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type RatingOption<T> = {
  value: T;
  label: string;
  icon: LucideIcon;
};

const OVERALL_OPTIONS: RatingOption<boolean>[] = [
  { value: true, label: "Loved it", icon: Heart },
  { value: false, label: "Didn't like", icon: HeartCrack },
];

const SPICE_OPTIONS: RatingOption<"too_mild" | "just_right" | "too_hot">[] = [
  { value: "too_mild", label: "Mild", icon: Snowflake },
  { value: "just_right", label: "Perfect", icon: Check },
  { value: "too_hot", label: "Hot", icon: Flame },
];

const SWEET_OPTIONS: RatingOption<"not_sweet" | "just_right" | "too_sweet">[] = [
  { value: "not_sweet", label: "Less", icon: Minus },
  { value: "just_right", label: "Perfect", icon: Check },
  { value: "too_sweet", label: "More", icon: Candy },
];

const SALT_OPTIONS: RatingOption<"bland" | "just_right" | "too_salty">[] = [
  { value: "bland", label: "Bland", icon: CircleDot },
  { value: "just_right", label: "Perfect", icon: Check },
  { value: "too_salty", label: "Salty", icon: Sparkles },
];

const TEXTURE_OPTIONS: RatingOption<"bad" | "okay" | "great">[] = [
  { value: "bad", label: "Bad", icon: ThumbsDown },
  { value: "okay", label: "Okay", icon: Check },
  { value: "great", label: "Great", icon: ThumbsUp },
];

const ORDER_AGAIN_OPTIONS: RatingOption<boolean>[] = [
  { value: true, label: "Yes!", icon: ThumbsUp },
  { value: false, label: "No", icon: ThumbsDown },
];

interface RatingRowProps<T> {
  label: string;
  options: RatingOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

function RatingRow<T>({ label, options, value, onChange }: RatingRowProps<T>) {
  return (
    <div className="bg-surface border border-border rounded-xl sm:rounded-[20px] p-2.5 sm:p-4 space-y-2 sm:space-y-3">
      <span className="section-label text-[10px] sm:text-xs">{label}</span>
      <div className={cn(
        "grid gap-1.5 sm:gap-2",
        options.length === 2 ? "grid-cols-2" : "grid-cols-3"
      )}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5",
                "py-2.5 sm:py-3 px-1.5 sm:px-3 rounded-xl sm:rounded-[14px] border",
                "text-[10px] sm:text-sm font-medium transition-all duration-75",
                "active:scale-[0.97]",
                isSelected
                  ? "bg-accent-yellow text-white border-accent-yellow shadow-none translate-y-[2px] sm:translate-y-[3px]"
                  : "bg-raised text-text-primary border-border shadow-[2px_2px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] active:translate-y-[2px] active:shadow-none"
              )}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
              <span className="leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepTasteButtons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    user,
    isReturning,
    phoneNumber,
    selectedDishes,
    likedOverall,
    setLikedOverall,
    spiceRating,
    setSpiceRating,
    sweetRating,
    setSweetRating,
    saltRating,
    setSaltRating,
    textureRating,
    setTextureRating,
    wouldOrderAgain,
    setWouldOrderAgain,
    setUpdatedProfile,
    setStep,
  } = useFeedbackStore();

  const handleSubmit = async () => {
    if (likedOverall === null) {
      setError("Please tell us how you felt overall");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Calculate vibe score based on overall feedback
      const calculatedVibe = likedOverall ? 80 : 40;

      // Submit feedback for each selected dish
      let lastProfile = null;
      for (const dish of selectedDishes) {
        lastProfile = await client.feedback.submit({
          phone_number: phoneNumber,
          dish_id: dish.id,
          liked_overall: likedOverall,
          spice_rating: spiceRating,
          sweet_rating: sweetRating,
          salt_rating: saltRating,
          texture_rating: textureRating,
          would_order_again: wouldOrderAgain,
          vibe_score: calculatedVibe,
        });
      }

      // If no dishes selected, still submit general feedback
      if (selectedDishes.length === 0) {
        lastProfile = await client.feedback.submit({
          phone_number: phoneNumber,
          dish_id: null,
          liked_overall: likedOverall,
          spice_rating: spiceRating,
          sweet_rating: sweetRating,
          salt_rating: saltRating,
          texture_rating: textureRating,
          would_order_again: wouldOrderAgain,
          vibe_score: calculatedVibe,
        });
      }

      setUpdatedProfile(lastProfile);
      setStep("result");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format dish names for header
  const dishNames = selectedDishes.length > 0
    ? selectedDishes.length === 1
      ? selectedDishes[0].name
      : `${selectedDishes.length} dishes`
    : "your meal";

  return (
    <div className="min-h-svh bg-base pb-24 sm:pb-28">
      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-2.5 sm:space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-lg sm:text-2xl font-bold text-text-primary">
            How was {dishNames}?
          </h1>
          {isReturning && user && (
            <p className="text-text-secondary text-xs sm:text-sm">
              Let's refine your taste profile!
            </p>
          )}
        </div>

        {/* Selected dishes preview - horizontal scroll */}
        {selectedDishes.length > 0 && (
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-hide">
            {selectedDishes.map((dish) => (
              <div
                key={dish.id}
                className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 bg-surface border border-border rounded-full px-2 sm:px-3 py-1 sm:py-1.5"
              >
                {dish.image_url && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden relative">
                    <Image
                      src={dish.image_url}
                      alt={dish.name}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                )}
                <span className="text-[10px] sm:text-xs font-medium text-text-primary whitespace-nowrap">
                  {dish.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Rating sections */}
        <RatingRow
          label="OVERALL"
          options={OVERALL_OPTIONS}
          value={likedOverall}
          onChange={setLikedOverall}
        />

        <RatingRow
          label="SPICE LEVEL"
          options={SPICE_OPTIONS}
          value={spiceRating}
          onChange={setSpiceRating}
        />

        <RatingRow
          label="SWEETNESS"
          options={SWEET_OPTIONS}
          value={sweetRating}
          onChange={setSweetRating}
        />

        <RatingRow
          label="SALTINESS"
          options={SALT_OPTIONS}
          value={saltRating}
          onChange={setSaltRating}
        />

        <RatingRow
          label="TEXTURE"
          options={TEXTURE_OPTIONS}
          value={textureRating}
          onChange={setTextureRating}
        />

        <RatingRow
          label="ORDER AGAIN?"
          options={ORDER_AGAIN_OPTIONS}
          value={wouldOrderAgain}
          onChange={setWouldOrderAgain}
        />

        {/* Error message */}
        {error && (
          <p className="text-accent-red text-xs sm:text-sm text-center">{error}</p>
        )}

        {/* Submit button - floating at bottom */}
        <div className="floating-action">
          <div className="floating-action-inner">
            <Button
              type="button"
              variant="primary"
              size="xl"
              className="w-full text-base sm:text-lg"
              onClick={handleSubmit}
              loading={loading}
              disabled={likedOverall === null}
            >
              SUBMIT FEEDBACK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
