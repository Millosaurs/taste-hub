"use client";

import { Button } from "@/components/ui/button";
import { FlavorBar, ProgressBar } from "@/components/ui/progress-bar";
import { CategoryBadge } from "@/components/ui/badge";
import { useFeedbackStore } from "@/store/feedbackStore";
import type { FlavorProfile } from "@idt-shit/db";

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
    <div className="min-h-svh bg-canvas flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="card space-y-5 sm:space-y-6 text-center p-5 sm:p-6">
          {/* Thank you header */}
          <div className="space-y-2">
            <div className="text-5xl sm:text-5xl">🙏</div>
            <h1 className="text-3xl sm:text-3xl font-bold text-text-primary">
              Thank You!
            </h1>
            <p className="text-text-secondary text-base sm:text-base">
              Great to have you, {user?.name ?? "friend"}!
            </p>
          </div>

          {/* Category display */}
          <CategoryBadge
            emoji={updatedProfile.category_emoji ?? "🔍"}
            label={updatedProfile.category_label ?? "STILL DISCOVERING"}
            size="lg"
          />

          {/* Profile quote */}
          <div className="relative bg-raised rounded-[14px] p-4 sm:p-5">
            <span className="absolute -top-2 left-4 text-2xl text-accent-yellow">"</span>
            <p className="text-text-primary text-sm sm:text-base leading-relaxed italic px-2">
              {updatedProfile.category_message}
            </p>
            <span className="absolute -bottom-2 right-4 text-2xl text-accent-yellow">"</span>
          </div>

          {/* Flavor DNA */}
          <div className="space-y-3 sm:space-y-4 text-left">
            <h3 className="section-label text-center text-xs">YOUR FLAVOR DNA</h3>
            <div className="space-y-3">
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
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Profile Confidence</span>
              <span className="text-text-primary font-mono-numbers">
                {confidencePercent}% • {confidenceLabel}
              </span>
            </div>
            <ProgressBar value={updatedProfile.confidence ?? 0} animated />
            <p className="text-xs text-text-muted text-center pt-1">
              {confidencePercent < 75 
                ? `${8 - visitCount} more visits to fully understand your palate`
                : "We know your taste! Recommendations will be spot-on 🎯"
              }
            </p>
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

          {/* Return message */}
          <p className="text-sm text-text-muted">
            See you next time! 👋
          </p>
        </div>
      </div>
    </div>
  );
}
