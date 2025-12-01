//src/app/hall-portal/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import HallCard from "@/components/HallCard";
// If you have this helper, keep it. If not, the fallback below handles it anyway.
import { getStoredUser } from "@/lib/auth";
import ApplySeatButton from "@/components/ApplySeatButton";
import ViewMangeApplication from "@/components/ViewManageApplication";


type AnyUser =
  | {
    is_superuser?: boolean;
    is_staff?: boolean;
    role?: string;
    [k: string]: any;
  }
  | null
  | undefined;

/** Defensive read from common localStorage keys if getStoredUser() isn't available or returns null */
function fallbackReadUserFromStorage(): AnyUser {
  if (typeof window === "undefined") return null;

  // common keys your app might use:
  const keys = ["user", "auth", "profile", "currentUser"];
  for (const k of keys) {
    const raw = localStorage.getItem(k);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      // some apps nest the user inside { user: {...} } or { data: { user: {...} } }
      const candidate =
        parsed?.user ??
        parsed?.data?.user ??
        parsed?.profile ??
        parsed;
      if (candidate && typeof candidate === "object") return candidate as AnyUser;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export default function HallPortal() {
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    // Try the helper first, then fallback
    let user: AnyUser = undefined;
    try {
      user = typeof getStoredUser === "function" ? (getStoredUser() as AnyUser) : undefined;
    } catch {
      /* ignore */
    }
    if (!user) {
      user = fallbackReadUserFromStorage();
    }

    const isAdmin =
      !!user?.is_superuser ||
      !!user?.is_staff ||
      (typeof user?.role === "string" && ["admin", "superuser", "moderator"].includes(user.role.toLowerCase()));

    setIsSuperUser(isAdmin);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="max-w-7xl mx-auto px-5 py-10">
        <section className="mb-6">
          <div className="rounded-3xl px-6 md:px-10 py-6 md:py-8 bg-gradient-to-r from-[#0f2027] via-[#0f5e73] to-[#0b7872] text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="text-3xl md:text-4xl leading-none">📢</div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Hall Portal</h1>
                <p className="text-white/85 mt-1 md:mt-2">Loading your access…</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-10">
      {/* Hero Section */}
      <section className="mb-6">
        <div className="rounded-3xl px-6 md:px-10 py-6 md:py-8 bg-gradient-to-r from-[#0f2027] via-[#0f5e73] to-[#0b7872] text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-3xl md:text-4xl leading-none">📢</div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Hall Portal</h1>
              <p className="text-white/85 mt-1 md:mt-2">
                Students can apply for a seat. Admins can manage applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section
        aria-label="Hall Portal Sections"
        className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {/* Show only to normal users */}
        {!isSuperUser && (
          <HallCard
            key="apply-seat"
            section="Apply for Seat"
            description="Students can apply for a seat in the hall."
          >
            <ApplySeatButton className="btn btn-primary px-4 py-2 rounded-xl" />
          </HallCard>
        )}

        {/* Show only to superusers/admins */}
        {isSuperUser && (
          <>
            <HallCard
              key="view-applications"
              section="View Applications"
              description="Admins can view and manage student applications."
            >
              <ViewMangeApplication className="btn btn-primary px-4 py-2 rounded-xl" />
            </HallCard>
            <HallCard
              key="manage-applications"
              section="Manage Student Seats"
              description="Admins can manage Seats of Hall."
            />
          </>
        )}
      </section>
    </main>
  );
}
