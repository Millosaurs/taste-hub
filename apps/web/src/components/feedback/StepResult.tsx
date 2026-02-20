"use client";

import { Button } from "@/components/ui/button";
import { FlavorBar, ProgressBar } from "@/components/ui/progress-bar";
import { CategoryBadge } from "@/components/ui/badge";
import { useFeedbackStore } from "@/store/feedbackStore";
import type { FlavorProfile } from "@idt-shit/db";
import { PartyPopper } from "lucide-react";

const FLAVOR_LABELS: Array<{ key: keyof FlavorProfile; label: string }> = [
  { key: "spice", label: "Spice" },
  { key: "sweet", label: "Sweet" },
  { key: "salty", label: "Salty" },
  { key: "sour", label: "Sour" },
  { key: "bitter", label: "Bitter" },
  { key: "umami", label: "Umami" },
];

export function StepResult() {
  const { user, updatedProfile, reset } = useFeedbackStore();

  const handleDone = () => {
    reset();
  };

  if (!updatedProfile) {
    return null;
  }

  const visitCount = user?.visit_count ?? 1;
  const confidencePercent = Math.round((updatedProfile.confidence ?? 0) * 100);
  const confidenceLabel =
    confidencePercent >= 75
      ? "Established"
      : confidencePercent >= 40
        ? "Building"
        : "New";

  return (
    <div className="min-h-svh bg-base flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="card space-y-5 sm:space-y-6 text-center p-4 sm:p-6">
          {/* Thank you header */}
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
              Thanks, {user?.name ?? "friend"}!
            </h1>
            <PartyPopper className="w-6 h-6 sm:w-7 sm:h-7 text-accent-yellow" />
          </div>

          {/* Category display */}
          <CategoryBadge
            category={updatedProfile.category_label ?? "STILL DISCOVERING"}
            size="lg"
          />

          {/* Category message */}
          <div className="bg-raised rounded-[14px] p-3 sm:p-4">
            <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
              {updatedProfile.category_message}
            </p>
          </div>

          {/* Flavor DNA */}
          <div className="space-y-3 sm:space-y-4 text-left">
            <h3 className="section-label text-center text-[10px] sm:text-xs">YOUR FLAVOR DNA</h3>
            <div className="space-y-2.5 sm:space-y-3">
              {FLAVOR_LABELS.map((flavor, index) => (
                <FlavorBar
                  key={flavor.key}
                  label={flavor.label}
                  value={updatedProfile[flavor.key] ?? 5}
                  delay={index * 80}
                />
              ))}
            </div>
          </div>

          {/* Confidence bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-text-secondary">Confidence</span>
              <span className="text-text-primary font-mono-numbers">
                Visit {visitCount + 1} of 8 • {confidenceLabel}
              </span>
            </div>
            <ProgressBar value={updatedProfile.confidence ?? 0} animated />
          </div>

          {/* Done button */}
          <Button
            type="button"
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleDone}
          >
            DONE
          </Button>
        </div>
      </div>
    </div>
  );
}
