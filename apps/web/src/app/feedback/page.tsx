"use client";

import { useFeedbackStore } from "@/store/feedbackStore";
import { StepPhone } from "@/components/feedback/StepPhone";
import { StepName } from "@/components/feedback/StepName";
import { StepProfile } from "@/components/feedback/StepProfile";
import { StepDish } from "@/components/feedback/StepDish";
import { StepTasteButtons } from "@/components/feedback/StepTasteButtons";
import { StepResult } from "@/components/feedback/StepResult";

export default function FeedbackPage() {
  const { step } = useFeedbackStore();

  return (
    <main className="min-h-screen bg-canvas">
      {/* Phone step - always rendered as the base */}
      {step === "phone" && <StepPhone />}

      {/* Registration modal - overlays on phone step */}
      <StepName />

      {/* Profile step - for returning users */}
      {step === "profile" && <StepProfile />}

      {/* Dish selection step */}
      {step === "dish" && <StepDish />}

      {/* Taste buttons step */}
      {step === "taste" && <StepTasteButtons />}

      {/* Result step */}
      {step === "result" && <StepResult />}
    </main>
  );
}
