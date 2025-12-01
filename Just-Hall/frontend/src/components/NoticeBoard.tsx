// src/components/NoticeBoard.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import NoticeCard from "./NoticeCard";
import NoticeForm from "./NoticeForm";
import { Notice } from "../lib/notices";
import { useAuth } from "@/context/auth-context";

type Props = { canManage?: boolean };

type ApiNotice = {
  id: number;
  title: string;
  body: string;
  category: string;
  author: string;
  pinned: boolean;
  attachment_url: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
};

const API = "http://localhost:8000/api/notices";

// API -> UI
function toUi(n: ApiNotice): Notice {
  return {
    id: String(n.id),
    title: n.title,
    body: n.body,
    category: n.category as Notice["category"],
    author: n.author,
    pinned: n.pinned,
    attachmentUrl: n.attachment_url,
    expiresAt: n.expires_at,
    createdAt: n.created_at,
    updatedAt: n.updated_at ?? undefined,
  };
}

// UI -> API  (ensure expires_at is YYYY-MM-DD for DRF DateField)
function toApiPayload(n: Omit<Notice, "id" | "createdAt">) {
  const dateOnly =
    n.expiresAt
      ? /^\d{4}-\d{2}-\d{2}$/.test(n.expiresAt)
        ? n.expiresAt
        : new Date(n.expiresAt).toISOString().slice(0, 10)
      : null;

  return {
    title: n.title,
    body: n.body,
    category: n.category,
    author: n.author,
    pinned: n.pinned,
    attachment_url: n.attachmentUrl || null,
    expires_at: dateOnly,
  };
}

/** Try to pull a token from many common places in localStorage. */
function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;

  const direct = localStorage.getItem("token");
  if (direct) return direct;

  const authJson = localStorage.getItem("auth");
  if (authJson) {
    try {
      const auth = JSON.parse(authJson);
      if (auth?.token) return String(auth.token);
      if (auth?.access) return `Bearer ${auth.access}`; // JWT
    } catch {}
  }

  const authToken = localStorage.getItem("authToken");
  if (authToken) return authToken;

  const bearer = localStorage.getItem("access") || localStorage.getItem("access_token");
  if (bearer) return `Bearer ${bearer}`;

  const header = localStorage.getItem("Authorization");
  if (header) return header;

  return null;
}

/** Build Authorization header correctly for DRF Token or JWT values. */
function buildAuthHeader(raw?: string | null): HeadersInit {
  if (!raw) return {};
  const val = raw.trim();

  if (/^(Bearer|Token)\s+/i.test(val)) {
    return { Authorization: val };
  }
  if (val.includes(".")) {
    return { Authorization: `Bearer ${val}` };
  }
  return { Authorization: `Token ${val}` };
}

export default function NoticeBoard({ canManage = false }: Props) {
  const { token: ctxToken } = (useAuth?.() ?? {}) as { token?: string };
  const [tab, setTab] = useState<"student" | "admin">("student");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [editing, setEditing] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);

  // prefer context token, else hunt in localStorage
  const token = ctxToken ?? getTokenFromStorage() ?? "";

  useEffect(() => {
    if (!canManage && tab === "admin") setTab("student");
  }, [canManage, tab]);

  async function fetchNotices() {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`GET ${API} ${res.status}`);
      const data: ApiNotice[] = await res.json();
      setNotices(data.map(toUi));
    } catch (e) {
      console.error("Fetch notices failed:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotices();
  }, []);

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const matchesQuery = [n.title, n.body, n.author]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCat = category === "All" || n.category === category;
      const notExpired = !n.expiresAt || new Date(n.expiresAt) >= new Date();
      return matchesQuery && matchesCat && notExpired;
    });
  }, [notices, query, category]);

  // CREATE / UPDATE
  async function handleSubmit(payload: Omit<Notice, "id" | "createdAt">) {
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...buildAuthHeader(token),
      };

      const body = JSON.stringify(toApiPayload(payload));
      const url = editing?.id ? `${API}${editing.id}/` : API;
      const method = editing?.id ? "PUT" : "POST";

      console.log("[Notice save] →", {
        method,
        url,
        auth: (headers as any).Authorization ?? "<none>",
        body,
      });

      const res = await fetch(url, { method, headers, body });
      const text = await res.text();
      const ct = res.headers.get("content-type") || "";

      if (!res.ok) {
        console.error(`[Notice save] ${res.status}`, text);
        const msg =
          (ct.includes("application/json") &&
            (() => {
              try {
                const j = JSON.parse(text);
                return j.detail || j.error || j.message;
              } catch {
                return "";
              }
            })()) ||
          `HTTP ${res.status}: ${text.slice(0, 300)}`;
        alert(`Failed to save the notice.\n${msg}`);
        return;
      }

      await fetchNotices();
      setEditing(null);
    } catch (e) {
      console.error("Save notice failed:", e);
      alert("Failed to save the notice. Check console for details.");
    }
  }

  // DELETE
  async function handleDelete(id: string) {
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
        ...buildAuthHeader(token),
      };
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`DELETE ${res.status}`);
      await fetchNotices();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete the notice.");
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl overflow-hidden border">
          <button
            onClick={() => setTab("student")}
            className={`px-4 py-2 text-sm font-medium ${
              tab === "student" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
            }`}
          >
            Student
          </button>

          {canManage && (
            <button
              onClick={() => setTab("admin")}
              className={`px-4 py-2 text-sm font-medium ${
                tab === "admin" ? "bg-teal-600 text-white" : "bg-white text-gray-700"
              }`}
            >
              Admin
            </button>
          )}
        </div>

        {tab === "student" && (
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notices..."
              className="px-3 py-2 rounded-md border border-gray-300 w-56"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300"
            >
              {"All,General,Exam,Maintenance,Event,Emergency".split(",").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Board */}
      <div className="mt-6">
        {tab === "student" ? (
          loading ? (
            <div className="p-8 border rounded-2xl text-center text-gray-600 bg-white">
              Loading…
            </div>
          ) : filtered.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((n) => (
                <NoticeCard
                  key={n.id}
                  notice={n}
                  onEdit={canManage ? setEditing : undefined}
                  onDelete={canManage ? handleDelete : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 border rounded-2xl text-center text-gray-600 bg-white">
              No notices found.
            </div>
          )
        ) : canManage ? (
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Manage notices</h3>
                <button
                  onClick={() => setEditing({} as Notice)}
                  className="px-3 py-2 rounded-md bg-teal-600 text-white"
                >
                  New notice
                </button>
              </div>

              {notices.length ? (
                <div className="space-y-4">
                  {notices.map((n) => (
                    <NoticeCard
                      key={n.id}
                      notice={n}
                      onEdit={(notice) => setEditing(notice)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 border rounded-2xl text-center text-gray-600 bg-white">
                  No notices yet.
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="sticky top-6 p-5 border rounded-2xl bg-white/80 shadow-sm">
                <h4 className="text-md font-semibold mb-4">
                  {editing?.id ? "Edit notice" : "Create notice"}
                </h4>
                <NoticeForm
                  initial={editing ?? undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => setEditing(null)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 border rounded-2xl text-center text-gray-600 bg-white">
            You don’t have permission to manage notices.
          </div>
        )}
      </div>
    </div>
  );
}
