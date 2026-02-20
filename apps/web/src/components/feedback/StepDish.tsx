"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useFeedbackStore } from "@/store/feedbackStore";
import { client } from "@/utils/orpc";
import { cn } from "@/lib/utils";
import type { Dish } from "@idt-shit/db";

export function StepDish() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, selectedDishes, toggleDish, setStep } = useFeedbackStore();

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const result = await client.dishes.getAll();
        setDishes(result);
      } catch (err) {
        console.error("Failed to fetch dishes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  const handleContinue = () => {
    if (selectedDishes.length > 0) {
      setStep("taste");
    }
  };

  const isSelected = (dish: Dish) => selectedDishes.some((d) => d.id === dish.id);

  if (loading) {
    return (
      <div className="min-h-svh bg-canvas flex items-center justify-center">
        <div className="text-text-secondary">Loading dishes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-canvas pb-24 sm:pb-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            What did you have?
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            {user ? `Select your dishes, ${user.name}` : "Tap to select one or more"}
          </p>
          {selectedDishes.length > 0 && (
            <p className="text-accent-yellow text-sm font-medium">
              {selectedDishes.length} dish{selectedDishes.length !== 1 ? "es" : ""} selected
            </p>
          )}
        </div>

        {/* Dish grid - 2 cols mobile, 3 cols tablet+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {dishes.map((dish) => {
            const selected = isSelected(dish);
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => toggleDish(dish)}
                className={cn(
                  "relative overflow-hidden rounded-[14px] border-2 transition-all duration-75 text-left",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow",
                  "active:scale-[0.98]",
                  selected
                    ? "border-accent-yellow shadow-[3px_3px_0px_#1A1A1A] sm:shadow-[4px_4px_0px_#1A1A1A] -translate-y-0.5 sm:-translate-y-1"
                    : "border-border hover:border-text-muted active:border-accent-yellow"
                )}
              >
                {/* Image as card background */}
                <div className="aspect-square relative">
                  {dish.image_url ? (
                    <Image
                      src={dish.image_url}
                      alt={dish.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 200px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-raised flex items-center justify-center text-4xl">
                      🍽️
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  {selected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-accent-yellow rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-sm text-white font-bold">✓</span>
                    </div>
                  )}
                  
                  {/* Name at bottom-left with gradient fade */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-sm sm:text-base font-semibold text-white drop-shadow-lg line-clamp-2 leading-tight">
                      {dish.name}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating action button */}
      <div className="floating-action">
        <div className="floating-action-inner">
          <Button
            type="button"
            variant="primary"
            size="xl"
            className="w-full text-base sm:text-lg"
            onClick={handleContinue}
            disabled={selectedDishes.length === 0}
          >
            {selectedDishes.length === 0 
              ? "SELECT DISHES" 
              : `CONTINUE (${selectedDishes.length}) →`
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
