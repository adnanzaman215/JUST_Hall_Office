// src/app/office/page.tsx
"use client";
import React from "react";
import OfficeCard from "../../components/OfficeCard";
import { officeSections } from "../../lib/office";

export default function OfficePage() {
  return (
    <main className="max-w-7xl mx-auto px-5 py-10">
      {/* Hero */}
      <section className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">🏢 Office Section</h1>
        <p className="mt-2 text-sky-100 max-w-2xl">
          Contact details, locations, and working hours for Provost and Staff Offices.
        </p>
      </section>

      {/* Cards */}
      <section
        aria-label="Office Cards"
        className="grid gap-6 sm:grid-cols-2"
      >
        {officeSections.map((sec) => (
          <OfficeCard key={sec.key} office={sec.office} staff={sec.staff} />
        ))}
      </section>
    </main>
  );
}
