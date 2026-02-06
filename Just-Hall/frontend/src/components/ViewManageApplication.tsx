// src/components/ViewMangeApplication.tsx
"use client";

import { useRouter } from "next/navigation";

export default function ViewMangeApplication({ className = "" }) {
  const router = useRouter();

  const handleClick = () => {
      router.push("/hall-portal/view-application");
  };

  return (
    <button 
      type="button" 
      onClick={handleClick} 
      className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
      View Applications
    </button>
  );
}
