"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FlavorBar } from "@/components/ui/progress-bar";
import { CategoryBadge } from "@/components/ui/badge";
import { useFeedbackStore } from "@/store/feedbackStore";
import { client } from "@/utils/orpc";
import type { FlavorProfile, TasteProfile } from "@idt-shit/db";
import { Hand, ArrowRight } from "lucide-react";

const FLAVOR_LABELS: Array<{ key: keyof FlavorProfile; label: string }> = [
  { key: "spice", label: "Spice" },
  { key: "sweet", label: "Sweet" },
  { key: "salty", label: "Salty" },
  { key: "sour", label: "Sour" },
  { key: "bitter", label: "Bitter" },
  { key: "umami", label: "Umami" },
];

export function StepProfile() {
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, phoneNumber, setStep } = useFeedbackStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await client.profiles.getByPhone({ phone: phoneNumber });
        setProfile(result);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [phoneNumber]);

  const handleContinue = () => {
    setStep("dish");
  };

  if (loading) {
    return (
      <div className="min-h-svh bg-base flex items-center justify-center">
        <div className="text-text-secondary">Loading your profile...</div>
      </div>
    );
  }

  const visitCount = user?.visit_count ?? 0;

  return (
    <div className="min-h-svh bg-base flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="card space-y-5 sm:space-y-6 text-center p-4 sm:p-6">
          {/* Welcome header */}
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                Welcome back, {user?.name ?? "friend"}!
              </h1>
              <Hand className="w-6 h-6 sm:w-7 sm:h-7 text-accent-yellow" />
            </div>
            <p className="text-text-secondary text-sm mt-1">
              Visit #{visitCount + 1}
            </p>
          </div>

          {profile ? (
            <>
              {/* Category display */}
              <CategoryBadge
                category={profile.category_label ?? "STILL DISCOVERING"}
                size="lg"
              />

              {/* Category message */}
              <div className="bg-raised rounded-[14px] p-3 sm:p-4">
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                  {profile.category_message}
                </p>
              </div>

              {/* Flavor DNA */}
              <div className="space-y-3 sm:space-y-4 text-left">
                <h3 className="section-label text-center text-[10px] sm:text-xs">
                  YOUR FLAVOR DNA
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
                  {FLAVOR_LABELS.map((flavor, index) => (
                    <FlavorBar
                      key={flavor.key}
                      label={flavor.label}
                      value={profile[flavor.key] ?? 5}
                      delay={index * 80}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8">
              <p className="text-text-secondary">
                Let's start building your taste profile!
              </p>
            </div>
          )}

          {/* Continue button */}
          <Button
            type="button"
            variant="primary"
            size="xl"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleContinue}
          >
            GIVE FEEDBACK
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
