"use client";
import React from "react";

interface FacilityCardProps {
  name: string;
  icon?: string;
  blurb: string;
  details?: string[];
}

export default function FacilityCard({ name, icon, blurb, details }: FacilityCardProps) {
  return (
    <article
      role="region"
      aria-label={name}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-3xl mb-2" aria-hidden="true">
        {icon ?? "🏷️"}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      <p className="mt-1 text-sm text-gray-600">{blurb}</p>

      {details?.length ? (
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-gray-700">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
