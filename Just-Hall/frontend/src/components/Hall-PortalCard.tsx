"use client";
import React from "react";
import Image from "next/image";

interface Hall_ProtalCardProps {
  name: string;
  icon?: string;
  blurb: string;
  details?: string[];
}

export default function Hall_PortalCard({ name, icon, blurb, details }: Hall_ProtalCardProps) {
  return (
    <article
      role="region"
      aria-label={name}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="mb-4"
        aria-hidden="true"
        style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "150px", marginBottom: "16px" }}
      >
        {icon ? (
          <Image
            src={icon}
            alt={name}
            width={150}
            height={150}
            style={{ objectFit: "contain", borderRadius: "10px", objectPosition: "center" }}
          />
        ) : (
          "🏷"
        )}
      </div>
      <h3 className="text-lg font-semibold">{name}</h3>
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
