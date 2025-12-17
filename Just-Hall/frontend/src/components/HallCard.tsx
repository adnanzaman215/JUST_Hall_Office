"use client";
import React from "react";

type HallCardProps = {
  section: string;
  description: string;
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode; // ✅ allow custom action(s)
};

const HallCard = ({ section, description, href, onClick, children }: HallCardProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
      <h3 className="text-2xl font-bold text-gray-800">{section}</h3>
      <p className="text-gray-600 mt-3 text-base leading-relaxed">{description}</p>

      {/* Prefer custom children (e.g., ApplySeatButton) if provided */}
      {children ? (
        <div className="mt-4">{children}</div>
      ) : onClick ? (
        <button
          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          onClick={onClick}
        >
          {section}
        </button>
      ) : null}
    </div>
  );
};

export default HallCard;
