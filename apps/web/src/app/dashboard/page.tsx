"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { orpc } from "@/utils/orpc";
import { UsersTable } from "@/components/dashboard/UsersTable";
import { ProfileModal } from "@/components/dashboard/ProfileModal";
import type { ProfileWithUser } from "@idt-shit/api";

export default function DashboardPage() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithUser | null>(null);

  const { data: profiles, isLoading, error } = useQuery(
    orpc.profiles.getAll.queryOptions()
  );

  return (
    <main className="min-h-svh bg-base">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-accent-yellow">TASTE HUB</h1>
            <p className="text-text-secondary text-sm sm:text-base mt-0.5 sm:mt-1">Staff Dashboard</p>
          </div>
          <Link 
            href="/"
            className="text-xs sm:text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-16">
            <div className="text-text-muted text-sm">Loading users...</div>
          </div>
        ) : error ? (
          <div className="card text-center py-6 sm:py-8">
            <p className="text-accent-red text-sm">Failed to load users</p>
            <p className="text-xs sm:text-sm text-text-muted mt-2">
              Please check your connection and try again
            </p>
          </div>
        ) : (
          <UsersTable
            profiles={profiles ?? []}
            onSelectUser={setSelectedProfile}
          />
        )}

        {/* Profile Modal */}
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      </div>
    </main>
  );
}
