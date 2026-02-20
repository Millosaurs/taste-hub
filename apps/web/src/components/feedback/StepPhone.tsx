"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFeedbackStore } from "@/store/feedbackStore";
import { client } from "@/utils/orpc";
import { cn } from "@/lib/utils";

export function StepPhone() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");

  const { setPhoneNumber, setUser, setIsReturning, setStep } = useFeedbackStore();

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if user exists
      const existingUser = await client.users.getByPhone({ phone });

      setPhoneNumber(phone);

      if (existingUser) {
        // Returning user
        setUser(existingUser);
        setIsReturning(true);
        setWelcomeMessage(`Welcome back, ${existingUser.name}!`);

        // Show welcome message for 1.5s then go to profile step
        setTimeout(() => {
          setWelcomeMessage("");
          setStep("profile");
        }, 1500);
      } else {
        // New user
        setIsReturning(false);
        setStep("register");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format phone for display: XXXXX XXXXX
  const displayPhone = phone.replace(/(\d{5})(\d{5})/, "$1 $2").trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-svh px-4 py-8">
      {/* Welcome flash message */}
      {welcomeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md animate-fade-in">
          <div className="text-center px-4">
            <p className="text-4xl sm:text-5xl mb-3">👋</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">{welcomeMessage}</h2>
          </div>
        </div>
      )}

      {/* Logo/Wordmark */}
      <div className="mb-8 sm:mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-accent-yellow">tastefr</h1>
        <p className="text-text-secondary mt-1 sm:mt-2 text-sm sm:text-base">Know your palate</p>
      </div>

      {/* Phone input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 sm:space-y-6">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl text-text-primary mb-4 sm:mb-6">What's your number?</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 sm:gap-3 bg-surface border border-border rounded-[14px] p-3 sm:p-4">
            <span className="text-text-secondary font-mono text-sm sm:text-base">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              value={displayPhone}
              onChange={handlePhoneChange}
              placeholder="XXXXX XXXXX"
              className={cn(
                "flex-1 bg-transparent text-2xl sm:text-3xl font-mono-numbers text-text-primary",
                "placeholder:text-text-muted focus:outline-none",
                "tracking-wider min-w-0"
              )}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-accent-red text-xs sm:text-sm text-center">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="xl"
          className="w-full"
          loading={loading}
          disabled={phone.length !== 10}
        >
          CONTINUE →
        </Button>
      </form>
    </div>
  );
}
