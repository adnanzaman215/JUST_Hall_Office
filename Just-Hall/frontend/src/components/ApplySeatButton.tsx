// src/components/ApplySeatButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function ApplySeatButton({ className = "" }) {
  const router = useRouter();

  const handleClick = () => {
      router.push("/hall-portal/apply-seat");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Go to Apply for Seat
    </button>
  );
}
