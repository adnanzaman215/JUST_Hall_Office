//src/app/hall-portal/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import HallCard from "@/components/HallCard";
// If you have this helper, keep it. If not, the fallback below handles it anyway.
import { getStoredUser } from "@/lib/auth";
import ApplySeatButton from "@/components/ApplySeatButton";
import ViewMangeApplication from "@/components/ViewManageApplication";
import TrackApplicationButton from "@/components/TrackApplicationButton";
import { useRouter } from "next/navigation";


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
  const router = useRouter();
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <section className="mb-8">
            <div className="rounded-3xl px-6 md:px-10 py-8 md:py-10 bg-gradient-to-r from-[#0f2027] via-[#0f5e73] to-[#0b7872] text-white shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl md:text-5xl leading-none">📢</div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Hall Portal</h1>
                  <p className="text-white/90 mt-2 md:mt-3 text-lg">Loading your access…</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="rounded-3xl px-6 md:px-10 py-8 md:py-10 bg-gradient-to-r from-[#0f2027] via-[#0f5e73] to-[#0b7872] text-white shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="text-4xl md:text-5xl leading-none">📢</div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Hall Portal</h1>
                <p className="text-white/90 mt-2 md:mt-3 text-lg">
                  Students can apply for a seat. Admins can manage applications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section aria-label="Hall Portal Sections" className="space-y-8">
          {/* Show only to normal users */}
          {!isSuperUser && (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <HallCard
                key="apply-seat"
                section="Apply for Seat"
                description="Submit your application to secure a seat in the hall."
              >
                <ApplySeatButton />
              </HallCard>
              <HallCard
                key="track-application"
                section="Track Application"
                description="Check your application status using your tracking credentials."
              >
                <TrackApplicationButton />
              </HallCard>
            </div>
          )}

          {/* Show only to superusers/admins */}
          {isSuperUser && (
            <>
              {/* Admin Welcome Banner */}
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl">
                    👨‍💼
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h2>
                    <p className="text-white/90 text-sm md:text-base">Welcome back! Manage applications and student seats</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">Total Applications</p>
                    <p className="text-3xl font-bold">-</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">Pending Review</p>
                    <p className="text-3xl font-bold">-</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">Approved</p>
                    <p className="text-3xl font-bold">-</p>
                  </div>
                </div>
              </div>

              {/* Admin Action Cards */}
              <div className="grid gap-8 md:grid-cols-2">
                {/* View Applications Card */}
                <div className="group bg-white rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                        📋
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">View Applications</h3>
                        <p className="text-blue-100 text-sm mt-1">Review and manage student applications</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Review pending applications</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Approve or reject applications</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">View student details</span>
                      </li>
                    </ul>
                    <ViewMangeApplication className="w-full" />
                  </div>
                </div>

                {/* Manage Seats Card */}
                <div className="group bg-white rounded-2xl shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl">
                        🏢
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Manage Student Seats</h3>
                        <p className="text-emerald-100 text-sm mt-1">Control hall seat allocations</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Allocate seats to students</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Monitor seat availability</span>
                      </li>
                      <li className="flex items-center gap-3 text-gray-700">
                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Update seat assignments</span>
                      </li>
                    </ul>
                    <button 
                      onClick={() => router.push('/hall-portal/manage-seat')}
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage Seats
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
