"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FlavorBarProps {
  label: string;
  value: number; // 0-10
  animated?: boolean;
  delay?: number; // Animation delay in ms
}

export function FlavorBar({ label, value, animated = true, delay = 0 }: FlavorBarProps) {
  const [width, setWidth] = useState(animated ? 0 : value * 10);
  const percentage = value * 10;

  useEffect(() => {
    if (animated) {
      const timeout = setTimeout(() => {
        setWidth(percentage);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [animated, percentage, delay]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-12 sm:w-16 text-xs sm:text-sm text-text-secondary shrink-0">{label}</span>
      <div className="flex-1 h-1.5 sm:h-2 bg-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-yellow rounded-full transition-all duration-500 ease-out"
          style={{ width: `${animated ? width : percentage}%` }}
        />
      </div>
      <span className="w-8 sm:w-10 text-xs sm:text-sm font-mono-numbers text-text-primary text-right">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

interface ProgressBarProps {
  value: number; // 0-1
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({ value, label, animated = true, className }: ProgressBarProps) {
  const [width, setWidth] = useState(animated ? 0 : value * 100);
  const percentage = Math.min(100, Math.max(0, value * 100));

  useEffect(() => {
    if (animated) {
      const timeout = setTimeout(() => {
        setWidth(percentage);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [animated, percentage]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <span className="text-xs sm:text-sm text-text-secondary">{label}</span>}
      <div className="h-1.5 sm:h-2 bg-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-yellow rounded-full transition-all duration-600 ease-out"
          style={{ width: `${animated ? width : percentage}%` }}
        />
      </div>
    </div>
  );
}
