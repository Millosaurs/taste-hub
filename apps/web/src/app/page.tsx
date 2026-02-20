"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Dna,
  Tags,
  ArrowRight,
  LayoutDashboard,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  return (
    <main className="min-h-svh bg-base flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="text-center space-y-5 sm:space-y-6 max-w-lg w-full">
          {/* Logo */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-accent-yellow tracking-tight">
              TASTE HUB
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary">
              Know your palate
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-text-muted leading-relaxed px-2">
            A digital taste management system that builds personalized flavor 
            profiles based on your food preferences. Share your feedback and 
            discover your unique taste DNA.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center pt-4 px-2">
            <Link href="/feedback" className="w-full sm:w-auto">
              <Button variant="primary" size="xl" className="w-full px-8 flex items-center justify-center gap-2">
                GIVE FEEDBACK
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="w-full px-8 flex items-center justify-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                DASHBOARD
              </Button>
            </Link>
          </div>

          {/* API Status */}
          <div className="pt-6 sm:pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-raised border border-border rounded-full">
              {healthCheck.isLoading ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-text-muted animate-pulse" />
                  <span className="text-xs sm:text-sm text-text-muted">
                    Connecting...
                  </span>
                </>
              ) : healthCheck.data ? (
                <>
                  <Wifi className="w-4 h-4 text-accent-green" />
                  <span className="text-xs sm:text-sm text-text-muted">
                    API Connected
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-accent-red" />
                  <span className="text-xs sm:text-sm text-text-muted">
                    API Disconnected
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="px-4 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="card text-center space-y-2 sm:space-y-3 p-4 sm:p-5">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-yellow/10">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-accent-yellow" />
            </div>
            <h3 className="font-semibold text-text-primary text-sm sm:text-base">Quick Feedback</h3>
            <p className="text-xs sm:text-sm text-text-muted">
              Rate dishes in seconds with our simple tap interface
            </p>
          </div>
          <div className="card text-center space-y-2 sm:space-y-3 p-4 sm:p-5">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-yellow/10">
              <Dna className="w-5 h-5 sm:w-6 sm:h-6 text-accent-yellow" />
            </div>
            <h3 className="font-semibold text-text-primary text-sm sm:text-base">Taste DNA</h3>
            <p className="text-xs sm:text-sm text-text-muted">
              Discover your unique flavor profile across 6 dimensions
            </p>
          </div>
          <div className="card text-center space-y-2 sm:space-y-3 p-4 sm:p-5">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent-yellow/10">
              <Tags className="w-5 h-5 sm:w-6 sm:h-6 text-accent-yellow" />
            </div>
            <h3 className="font-semibold text-text-primary text-sm sm:text-base">18 Categories</h3>
            <p className="text-xs sm:text-sm text-text-muted">
              Get classified into fun categories like "Heat Seeker" or "Sweet Tooth"
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
