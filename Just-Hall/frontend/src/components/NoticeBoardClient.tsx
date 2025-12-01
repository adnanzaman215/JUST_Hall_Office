// src/components/NoticeBoardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import NoticeBoard from "@/components/NoticeBoard";

export default function NoticeBoardClient() {
  const { user: authUser } = useAuth();

  // read any user cached by your auth flow
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  const role =
    authUser?.role ??
    storedUser?.role ??
    (storedUser?.is_staff ? "admin" : "student");

  const canManage = role === "admin" || storedUser?.is_staff === true;

  return <NoticeBoard canManage={canManage} />;
}
