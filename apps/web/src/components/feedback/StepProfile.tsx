"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FlavorBar } from "@/components/ui/progress-bar";
import { CategoryBadge } from "@/components/ui/badge";
import { useFeedbackStore } from "@/store/feedbackStore";
import { client } from "@/utils/orpc";
import type { FlavorProfile, TasteProfile } from "@idt-shit/db";

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
      <div className="min-h-svh bg-canvas flex items-center justify-center">
        <div className="text-text-secondary">Loading your profile...</div>
      </div>
    );
  }

  const visitCount = user?.visit_count ?? 0;

  return (
    <div className="min-h-svh bg-canvas flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md">
        <div className="card space-y-5 sm:space-y-6 text-center p-5 sm:p-6">
          {/* Welcome header */}
          <div className="space-y-1">
            <p className="text-4xl">👋</p>
            <h1 className="text-2xl sm:text-2xl font-bold text-text-primary">
              Welcome back, {user?.name ?? "friend"}!
            </h1>
            <p className="text-text-secondary text-sm">
              Visit #{visitCount + 1}
            </p>
          </div>

          {profile ? (
            <>
              {/* Category display */}
              <CategoryBadge
                emoji={profile.category_emoji ?? "🔍"}
                label={profile.category_label ?? "STILL DISCOVERING"}
                size="lg"
              />

              {/* Category message */}
              <div className="relative bg-raised rounded-[14px] p-4">
                <span className="absolute -top-2 left-4 text-2xl text-accent-yellow">"</span>
                <p className="text-text-primary text-sm leading-relaxed italic px-2">
                  {profile.category_message}
                </p>
                <span className="absolute -bottom-2 right-4 text-2xl text-accent-yellow">"</span>
              </div>

              {/* Flavor DNA */}
              <div className="space-y-3 text-left">
                <h3 className="section-label text-center text-xs">
                  YOUR FLAVOR DNA
                </h3>
                <div className="space-y-3">
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
              <p className="text-text-secondary text-base">
                Let's start building your taste profile!
              </p>
            </div>
          )}

          {/* Continue button */}
          <Button
            type="button"
            variant="primary"
            size="xl"
            className="w-full"
            onClick={handleContinue}
          >
            GIVE FEEDBACK →
          </Button>
        </div>
      </div>
    </div>
  );
}
