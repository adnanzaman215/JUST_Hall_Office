// src/app/office/page.tsx
"use client";
import React from "react";
import OfficeCard from "../../components/OfficeCard";
import { officeSections } from "../../lib/office";

export default function OfficePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-5xl font-black text-white">Office Section</h1>
          </div>
          <p className="text-cyan-50 text-xl font-medium">
            Contact details, locations, and working hours for Provost and Staff Offices
          </p>
        </div>

        {/* Office Cards */}
        <section className="grid gap-6 md:grid-cols-2">
          {officeSections.map((sec) => (
            <OfficeCard key={sec.key} office={sec.office} staff={sec.staff} />
          ))}
        </section>
      </div>
    </div>
  );
}
