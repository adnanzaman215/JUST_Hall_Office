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
    <div className="bg-white p-5 rounded-lg shadow-lg hover:shadow-2xl transition duration-200 ease-in-out">
      <h3 className="text-xl font-semibold text-gray-700">{section}</h3>
      <p className="text-gray-500 mt-2">{description}</p>

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
