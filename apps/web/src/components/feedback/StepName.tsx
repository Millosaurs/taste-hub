"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/modal";
import { useFeedbackStore } from "@/store/feedbackStore";
import { client } from "@/utils/orpc";
import { cn } from "@/lib/utils";
import type { TasteTag } from "@idt-shit/db";
import {
  Sparkles,
  Flame,
  Citrus,
  Candy,
  Leaf,
  Beef,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const TASTE_TAGS: Array<{ key: TasteTag; icon: LucideIcon; label: string }> = [
  { key: "purist", icon: Sparkles, label: "The Purist" },
  { key: "heat", icon: Flame, label: "Heat Seeker" },
  { key: "citrus", icon: Citrus, label: "Citrus & Bright" },
  { key: "sweet", icon: Candy, label: "Sweet Tooth" },
  { key: "herby", icon: Leaf, label: "Herby & Earthy" },
  { key: "savory", icon: Beef, label: "Bold & Savory" },
];

export function StepName() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    step,
    phoneNumber,
    name,
    setName,
    selectedTags,
    toggleTag,
    setUser,
    setStep,
  } = useFeedbackStore();

  const isOpen = step === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (selectedTags.length === 0) {
      setError("Please select at least 1 taste preference");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newUser = await client.users.create({
        phone: phoneNumber,
        name: name.trim(),
        tags: selectedTags,
      });

      setUser(newUser);
      setStep("dish");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("phone");
  };

  return (
    <BottomSheet open={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">
            Let's get you set up
          </h2>
        </div>

        {/* Name input */}
        <div className="space-y-2">
          <label className="section-label">Your first name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Enter your name"
            className={cn(
              "w-full bg-raised border border-border rounded-[14px] px-3 sm:px-4 py-2.5 sm:py-3",
              "text-sm sm:text-base text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:border-accent-yellow"
            )}
            autoFocus
            maxLength={40}
          />
        </div>

        {/* Taste tags */}
        <div className="space-y-3">
          <label className="section-label">
            What describes you? (pick up to 3)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {TASTE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.key);
              const isDisabled = !isSelected && selectedTags.length >= 3;
              const Icon = tag.icon;

              return (
                <button
                  key={tag.key}
                  type="button"
                  onClick={() => toggleTag(tag.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-[14px] border transition-all duration-75",
                    isSelected
                      ? "bg-accent-yellow text-white border-accent-yellow shadow-[0px_0px_0px_#1A1A1A] translate-y-[3px]"
                      : "bg-raised text-text-primary border-border shadow-[4px_4px_0px_#1A1A1A] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_#1A1A1A] active:translate-y-[3px] active:shadow-[0px_0px_0px_#1A1A1A]",
                    isDisabled && "opacity-40 pointer-events-none"
                  )}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                    {tag.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-accent-red text-xs sm:text-sm text-center">{error}</p>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full flex items-center justify-center gap-2"
          loading={loading}
          disabled={name.trim().length < 2 || selectedTags.length === 0}
        >
          LET'S GO
          <ArrowRight className="w-5 h-5" />
        </Button>
      </form>
    </BottomSheet>
  );
}
