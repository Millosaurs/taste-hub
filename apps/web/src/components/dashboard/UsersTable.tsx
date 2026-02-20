"use client";

import { useState, useMemo } from "react";
import type { ProfileWithUser } from "@idt-shit/api";
import { CategoryBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, Search } from "lucide-react";

interface UsersTableProps {
  profiles: ProfileWithUser[];
  onSelectUser: (profile: ProfileWithUser) => void;
}

export function UsersTable({ profiles, onSelectUser }: UsersTableProps) {
  const [search, setSearch] = useState("");

  // Filter profiles by name or phone
  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;

    const query = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.user.name.toLowerCase().includes(query) ||
        p.user.phone_number.includes(query)
    );
  }, [profiles, search]);

  // Mask phone number: show last 4 digits only
  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    return `+91 ${phone.slice(-4).padStart(phone.length, "X")}`;
  };

  // Format vibe as percentage
  const formatVibe = (vibe: number | null) => {
    if (vibe === null || vibe === undefined) return "—";
    return `${Math.round(vibe)}%`;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className={cn(
            "w-full bg-raised border border-border rounded-[14px] pl-10 pr-10 py-2.5 sm:py-3",
            "text-sm text-text-primary placeholder:text-text-muted",
            "focus:outline-none focus:border-accent-yellow"
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Cards View */}
      <div className="block sm:hidden space-y-2">
        {filteredProfiles.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-muted text-sm">
              {search ? "No users found matching your search" : "No users yet"}
            </p>
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div
              key={profile.phone_number}
              onClick={() => onSelectUser(profile)}
              className="card p-3 cursor-pointer hover:border-accent-yellow transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate">
                    {profile.user.name}
                  </p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {maskPhone(profile.user.phone_number)}
                  </p>
                </div>
                <div className="text-xs text-text-secondary font-medium uppercase">
                  {profile.category_label ?? "NEW"}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                <span className="text-xs text-text-muted">
                  Visits: <span className="font-mono-numbers text-text-primary">{profile.user.visit_count ?? 0}</span>
                </span>
                <span className="text-xs text-text-muted">
                  Vibe: <span className="font-mono-numbers text-text-primary">{formatVibe(profile.avg_vibe)}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-raised/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Profile
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Visits
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Vibe
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                    {search ? "No users found matching your search" : "No users yet"}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <tr
                    key={profile.phone_number}
                    onClick={() => onSelectUser(profile)}
                    className={cn(
                      "border-b border-border last:border-b-0 cursor-pointer",
                      "hover:bg-raised/50 transition-colors"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-text-primary">
                        {profile.user.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-text-secondary">
                        {maskPhone(profile.user.phone_number)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">
                        {profile.category_label ?? "DISCOVERING"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono-numbers text-text-primary">
                        {profile.user.visit_count ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono-numbers text-text-primary">
                        {formatVibe(profile.avg_vibe)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs sm:text-sm text-text-muted text-center">
        {filteredProfiles.length} user{filteredProfiles.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>
    </div>
  );
}
