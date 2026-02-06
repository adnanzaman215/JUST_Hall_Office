"use client";
import React, { useState } from "react";

interface FacilityCardProps {
  name: string;
  icon?: string;
  blurb: string;
  details?: string[];
}

export default function FacilityCard({ name, icon, blurb, details }: FacilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      role="region"
      aria-label={name}
      className="group relative rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-5xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
            {icon ?? "🏷️"}
          </div>
          <div className="bg-indigo-100 group-hover:bg-blue-700 rounded-full p-2 transition-colors duration-300">
            <svg className="w-5 h-5 text-blue-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
          {name}
        </h3>

        {/* Blurb */}
        <p className="text-gray-600 leading-relaxed font-medium mb-4">{blurb}</p>

        {/* Details */}
        {details && details.length > 0 && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors mb-3"
            >
              <span>{isExpanded ? "Hide" : "View"} Details</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <ul className="space-y-2 mt-3 border-t-2 border-gray-100 pt-3">
                {details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Badge */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-black">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Available 24/7
          </span>
        </div>
      </div>
    </article>
  );
}
