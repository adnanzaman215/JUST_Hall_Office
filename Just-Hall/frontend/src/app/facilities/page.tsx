// src/app/facilities/page.tsx
"use client";
import React from "react";
import FacilityCard from "../../components/FacilityCard";
import { facilities } from "../../lib/facilities";

export default function FacilitiesPage() {
  return (
    <main className="max-w-6xl mx-auto px-5 py-8 md:py-10">
      {/* Hero */}
      <section className="flex items-end justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-red-500">
            Facilities
          </h1>
          <p className="mt-1 text-blue-400">
            Everything available in the hall, at a glance.
          </p>
        </div>
      </section>



      {/* Grid */}
      <section
        aria-label="Facilities Grid"
        className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {facilities.map((f) => (
          <FacilityCard
            key={f.key}
            name={f.name}
            icon={f.icon}
            blurb={f.blurb}
            details={f.details}
          />
        ))}
      </section>
    </main>
  );
}
