"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ProfileWithUser, FeedbackEntryWithDish } from "@idt-shit/api";
import type { FlavorProfile } from "@idt-shit/db";
import { Modal } from "@/components/ui/modal";
import { FlavorBar, ProgressBar } from "@/components/ui/progress-bar";
import { CategoryBadge, TasteTagBadge, type TasteTag } from "@/components/ui/badge";
import { client } from "@/utils/orpc";
import { X, Heart, HeartCrack, UtensilsCrossed } from "lucide-react";

interface ProfileModalProps {
  profile: ProfileWithUser | null;
  onClose: () => void;
}

const FLAVOR_LABELS: Array<{ key: keyof FlavorProfile; label: string }> = [
  { key: "spice", label: "Spice" },
  { key: "sweet", label: "Sweet" },
  { key: "salty", label: "Salty" },
  { key: "sour", label: "Sour" },
  { key: "bitter", label: "Bitter" },
  { key: "umami", label: "Umami" },
];

export function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const [orderHistory, setOrderHistory] = useState<FeedbackEntryWithDish[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (profile?.user.phone_number) {
      setLoadingHistory(true);
      client.feedback
        .getByPhoneWithDishes({ phone: profile.user.phone_number })
        .then(setOrderHistory)
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    } else {
      setOrderHistory([]);
    }
  }, [profile?.user.phone_number]);

  if (!profile) return null;

  const { user } = profile;
  const confidencePercent = Math.round((profile.confidence ?? 0) * 100);
  const confidenceLabel =
    confidencePercent >= 75
      ? "Established"
      : confidencePercent >= 40
        ? "Building"
        : "New";

  // Mask phone for display
  const maskedPhone = `+91 ${user.phone_number.slice(0, 2)}XXX XXX${user.phone_number.slice(-2)}`;

  // Format last updated date
  const formatLastVisit = (dateStr: string | null) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const tasteTags = (user.taste_tags ?? []) as TasteTag[];

  // Get unique dishes from order history
  const uniqueDishes = orderHistory
    .filter((entry) => entry.dish)
    .reduce((acc, entry) => {
      if (entry.dish && !acc.find((d) => d.id === entry.dish?.id)) {
        acc.push(entry.dish);
      }
      return acc;
    }, [] as NonNullable<FeedbackEntryWithDish["dish"]>[]);

  return (
    <Modal open={!!profile} onClose={onClose}>
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-raised hover:bg-border text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4 sm:space-y-6 pt-2">
        {/* User info */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">{user.name}</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            {maskedPhone} • {user.visit_count ?? 0} visit{(user.visit_count ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Category badge */}
        <CategoryBadge
          category={profile.category_label ?? "STILL DISCOVERING"}
          size="md"
        />

        {/* Category message */}
        {profile.category_message && (
          <div className="bg-raised rounded-[14px] p-3 sm:p-4">
            <p className="text-text-secondary text-xs sm:text-sm leading-relaxed text-center">
              {profile.category_message}
            </p>
          </div>
        )}

        {/* Flavor DNA */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="section-label text-center text-[10px] sm:text-xs">FLAVOR DNA</h3>
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

        {/* Confidence bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-text-secondary">Confidence</span>
            <span className="text-text-primary font-mono-numbers">
              {confidencePercent}% • {confidenceLabel}
            </span>
          </div>
          <ProgressBar value={profile.confidence ?? 0} animated />
        </div>

        {/* Order History - Dishes */}
        {uniqueDishes.length > 0 && (
          <div className="space-y-3">
            <h3 className="section-label text-center text-[10px] sm:text-xs">
              DISHES ORDERED ({uniqueDishes.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {uniqueDishes.slice(0, 8).map((dish) => (
                <div
                  key={dish.id}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] overflow-hidden relative bg-raised border border-border">
                    {dish.image_url ? (
                      <Image
                        src={dish.image_url}
                        alt={dish.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs text-text-secondary text-center line-clamp-1 max-w-full">
                    {dish.name}
                  </span>
                </div>
              ))}
            </div>
            {uniqueDishes.length > 8 && (
              <p className="text-[10px] text-text-muted text-center">
                +{uniqueDishes.length - 8} more dishes
              </p>
            )}
          </div>
        )}

        {/* Recent Feedback Timeline */}
        {orderHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="section-label text-center text-[10px] sm:text-xs">
              RECENT VISITS
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {orderHistory.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2 bg-raised rounded-[10px]"
                >
                  {entry.dish?.image_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0">
                      <Image
                        src={entry.dish.image_url}
                        alt={entry.dish.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {entry.dish?.name ?? "General feedback"}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {entry.liked_overall === true && (
                      <Heart className="w-4 h-4 text-accent-green" />
                    )}
                    {entry.liked_overall === false && (
                      <HeartCrack className="w-4 h-4 text-accent-red" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingHistory && (
          <p className="text-xs text-text-muted text-center">Loading history...</p>
        )}

        {/* Last visit */}
        <p className="text-xs sm:text-sm text-text-muted text-center">
          Last visit: {formatLastVisit(profile.last_updated)}
        </p>

        {/* Self-declared tags */}
        {tasteTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs text-text-muted text-center uppercase tracking-wider">
              Self-declared
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {tasteTags.map((tag) => (
                <TasteTagBadge key={tag} tag={tag} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
