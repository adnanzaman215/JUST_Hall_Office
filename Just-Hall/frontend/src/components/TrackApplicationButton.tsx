"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface TrackApplicationButtonProps {
  className?: string;
}

export default function TrackApplicationButton({ className = "" }: TrackApplicationButtonProps) {
  const router = useRouter();

  const defaultClasses =
    "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-teal-400";

  const finalClasses = className || defaultClasses;

  const handleClick = () => {
    router.push("/hall-portal/track-application");
  };

  return (
    <button
      onClick={handleClick}
      className={finalClasses}
      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
        />
      </svg>
      Track Status
    </button>
  );
}
