// src/app/facilities/page.tsx
"use client";
import React, { useState } from "react";
import FacilityCard from "../../components/FacilityCard";
import { facilities } from "../../lib/facilities";

export default function FacilitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = [
    { key: "all", label: "All Facilities", icon: "🏢" },
    { key: "study", label: "Study & Learning", icon: "📚" },
    { key: "recreation", label: "Recreation", icon: "🎮" },
    { key: "dining", label: "Dining & Food", icon: "🍽️" },
    { key: "utilities", label: "Utilities", icon: "🔧" },
  ];

  const categorizedFacilities = {
    study: ["reading-room"],
    recreation: ["games-room", "tv-room"],
    dining: ["dining", "canteen"],
    utilities: ["lift", "water-purifier", "garage", "room-facilities"],
  };

  const filteredFacilities = selectedCategory === "all" 
    ? facilities 
    : facilities.filter(f => {
        const categoryFacilities = categorizedFacilities[selectedCategory as keyof typeof categorizedFacilities] || [];
        return categoryFacilities.includes(f.key);
      });

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
            <h1 className="text-5xl font-black text-white">World-Class Facilities</h1>
          </div>
          <p className="text-cyan-50 text-xl font-medium">
            Experience excellence in student accommodation with modern amenities
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <div className="text-4xl font-black mb-2 text-gray-900">{facilities.length}+</div>
              <div className="text-gray-600 font-bold text-sm">Facilities</div>
            </div>
            <div className="text-center p-4 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-4xl font-black mb-2 text-gray-900">24/7</div>
              <div className="text-gray-600 font-bold text-sm">Availability</div>
            </div>
            <div className="text-center p-4 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                <svg className="w-8 h-8 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="text-4xl font-black mb-2 text-gray-900">10</div>
              <div className="text-gray-600 font-bold text-sm">Floors</div>
            </div>
            <div className="text-center p-4 hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                <svg className="w-8 h-8 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-4xl font-black mb-2 text-gray-900">300+</div>
              <div className="text-gray-600 font-bold text-sm">Rooms</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-base ${
                  selectedCategory === cat.key
                    ? "bg-gradient-to-r from-blue-700 to-cyan-700 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {selectedCategory === "all" ? "All Available Facilities" : categories.find(c => c.key === selectedCategory)?.label}
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Showing {filteredFacilities.length} {filteredFacilities.length === 1 ? "facility" : "facilities"}
          </p>
        </div>

        <section
          aria-label="Facilities Grid"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredFacilities.map((f) => (
            <FacilityCard
              key={f.key}
              name={f.name}
              icon={f.icon}
              blurb={f.blurb}
              details={f.details}
            />
          ))}
        </section>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-slate-800 to-blue-800 rounded-3xl p-10 text-white text-center shadow-2xl">
          <h2 className="text-4xl font-black mb-4">Need More Information?</h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Have questions about our facilities? Our support team is here to help you 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:scale-105">
              Contact Support
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all hover:scale-105">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
