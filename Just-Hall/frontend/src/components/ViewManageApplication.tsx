// src/components/ViewMangeApplication.tsx
"use client";

import { useRouter } from "next/navigation";

export default function ViewMangeApplication({ className = "" }) {
  const router = useRouter();

  const handleClick = () => {
      router.push("/hall-portal/view-application");
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Go to View/Manage Seats
    </button>
  );
}
