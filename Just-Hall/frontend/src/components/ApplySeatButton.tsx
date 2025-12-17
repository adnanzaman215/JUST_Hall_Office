// src/components/ApplySeatButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function ApplySeatButton({ className = "" }) {
  const router = useRouter();

  const handleClick = () => {
      router.push("/hall-portal/apply-seat");
  };

  const defaultClasses = "mt-4 w-full px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base rounded-xl hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl border-2 border-red-400 flex items-center justify-center gap-2";
  const finalClasses = className || defaultClasses;

  return (
    <button type="button" onClick={handleClick} className={finalClasses} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
      <span className="text-lg font-extrabold tracking-wide">Apply</span>
    </button>
  );
}
