//lib-notices.ts
// src/lib/notices.ts  (hardened)
export type NoticeCategory = "General" | "Exam" | "Maintenance" | "Event" | "Emergency";
export interface Notice { id: string; title: string; body: string; category: NoticeCategory; createdAt: string; updatedAt?: string; author: string; pinned?: boolean; attachmentUrl?: string | null; expiresAt?: string | null; }
const STORAGE_KEY = "justhall_notices_v1";

export function getNotices(): Notice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return (JSON.parse(raw) as Notice[]).sort(sortByPinnedThenDate);
  } catch (e) {
    console.error("getNotices failed:", e); return seed();
  }
}
export function saveNotices(n: Notice[]) { if (typeof window !== "undefined") try { localStorage.setItem(STORAGE_KEY, JSON.stringify(n)); } catch(e){ console.error("saveNotices failed:", e);} }
export function addNotice(n: Omit<Notice,"id"|"createdAt">): Notice[] { const list = getNotices(); const id = (typeof crypto!=="undefined" && "randomUUID" in crypto)? crypto.randomUUID(): String(Date.now()); const newNotice: Notice = { id, createdAt: new Date().toISOString(), ...n }; const updated = [newNotice, ...list]; saveNotices(updated); return updated.sort(sortByPinnedThenDate); }
export function updateNotice(id: string, patch: Partial<Notice>): Notice[] { const updated = getNotices().map(n => n.id===id? {...n, ...patch, updatedAt: new Date().toISOString()}: n); saveNotices(updated); return updated.sort(sortByPinnedThenDate); }
export function deleteNotice(id: string): Notice[] { const updated = getNotices().filter(n => n.id !== id); saveNotices(updated); return updated.sort(sortByPinnedThenDate); }
export function sortByPinnedThenDate(a: Notice,b: Notice){ if((a.pinned?1:0)!==(b.pinned?1:0)) return a.pinned?-1:1; return new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime(); }
function seed(): Notice[] { const demo: Notice[] = [{ id: String(Date.now())+"-pinned", title: "Hall Wi-Fi maintenance (Tonight)", body: "Network upgrades from 10:00 PM–12:30 AM. Expect brief outages.", category: "Maintenance", createdAt: new Date().toISOString(), author: "Admin", pinned: true, },{ id: String(Date.now())+"-exam", title: "Mid-term Exam Routine Published", body: "Download the routine from the attachment. Check room changes.", category: "Exam", createdAt: new Date(Date.now()-86400000).toISOString(), author: "Hall Office", attachmentUrl: "https://example.com/exam-routine.pdf", }]; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demo)); } catch{} return demo; }