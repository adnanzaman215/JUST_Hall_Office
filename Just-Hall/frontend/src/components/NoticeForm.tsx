// src/components/NoticeForm.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { Notice, NoticeCategory } from "../lib/notices";

const CATEGORIES: NoticeCategory[] = [
  "General",
  "Exam",
  "Maintenance",
  "Event",
  "Emergency",
];

type Props = {
  initial?: Partial<Notice>;
  onSubmit: (payload: Omit<Notice, "id" | "createdAt">) => void;
  onCancel?: () => void;
};

export default function NoticeForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [category, setCategory] = useState<NoticeCategory>(
    (initial?.category as NoticeCategory) ?? "General"
  );
  const [author, setAuthor] = useState(initial?.author ?? "Admin");
  const [pinned, setPinned] = useState(Boolean(initial?.pinned));
  const [attachmentUrl, setAttachmentUrl] = useState(initial?.attachmentUrl ?? "");
  const [expiresAt, setExpiresAt] = useState<string>(
    initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : ""
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ✨ Repopulate all fields whenever a new notice is chosen for editing (or switching to "new")
  useEffect(() => {
    setTitle(initial?.title ?? "");
    setBody(initial?.body ?? "");
    setCategory(((initial?.category as NoticeCategory) ?? "General"));
    setAuthor(initial?.author ?? "Admin");
    setPinned(Boolean(initial?.pinned));
    setAttachmentUrl(initial?.attachmentUrl ?? "");
    setExpiresAt(initial?.expiresAt ? new Date(initial.expiresAt).toISOString().slice(0, 10) : "");
    setTouched({}); // clear validation highlights on change
  }, [initial?.id, initial]);

  const titleOk = title.trim().length >= 4;
  const bodyOk = body.trim().length >= 20;
  const authorOk = author.trim().length >= 2;
  const attachOk =
    !attachmentUrl ||
    /^https?:\/\/[\w.-]+(?:\.[\w\.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(
      attachmentUrl.trim()
    );
  const dateOk = !expiresAt || !Number.isNaN(new Date(expiresAt).getTime());
  const isValid = titleOk && bodyOk && authorOk && attachOk && dateOk;

  const titleLen = title.trim().length;
  const bodyLen = body.trim().length;

  const errors = useMemo(() => {
    const e: string[] = [];
    if (touched["title"] && !titleOk) e.push("Title must be at least 4 characters.");
    if (touched["body"] && !bodyOk) e.push("Body must be at least 20 characters.");
    if (touched["author"] && !authorOk) e.push("Author must be at least 2 characters.");
    if (touched["attachmentUrl"] && !attachOk) e.push("Attachment URL must be a valid http(s) link.");
    if (touched["expiresAt"] && !dateOk) e.push("Expiry date is not valid.");
    return e;
  }, [touched, titleOk, bodyOk, authorOk, attachOk, dateOk]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    onSubmit({
      title: title.trim(),
      body: body.trim(),
      category,
      author: author.trim() || "Admin",
      pinned,
      attachmentUrl: attachmentUrl?.trim() ? attachmentUrl.trim() : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      updatedAt: undefined, // will come from API
    } as Omit<Notice, "id" | "createdAt">);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {errors.length > 0 && (
        <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title <span className="text-rose-600">*</span>
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          className={`w-full mt-1 rounded-md border bg-white px-3 py-2 text-black focus:ring-teal-500 focus:border-teal-500 ${
            touched["title"] && !titleOk ? "border-rose-400" : "border-gray-300"
          }`}
          placeholder="e.g., Power outage tonight"
          maxLength={120}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Give a short, specific headline.</span>
          <span>{titleLen}/120</span>
        </div>
      </div>

      {/* Category & Author */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NoticeCategory)}
            className="w-full mt-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-black focus:ring-teal-500 focus:border-teal-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Used for filtering and badges.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Author <span className="text-rose-600">*</span>
          </label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, author: true }))}
            className={`w-full mt-1 rounded-md border bg-white px-3 py-2 text-black focus:ring-teal-500 focus:border-teal-500 ${
              touched["author"] && !authorOk ? "border-rose-400" : "border-gray-300"
            }`}
            placeholder="Hall Office"
            maxLength={60}
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Name that will be shown under the notice.</span>
            <span>{author.trim().length}/60</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Body <span className="text-rose-600">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, body: true }))}
          rows={6}
          className={`w-full mt-1 rounded-md border bg-white px-3 py-2 text-black focus:ring-teal-500 focus:border-teal-500 ${
            touched["body"] && !bodyOk ? "border-rose-400" : "border-gray-300"
          }`}
          placeholder="Write the full notice here (details, times, locations, instructions)…"
          maxLength={4000}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Include date/time, location, contact, and any instructions.</span>
          <span>{bodyLen}/4000</span>
        </div>
      </div>

      {/* Attachment + Expiry */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Attachment URL</label>
          <input
            value={attachmentUrl ?? ""}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, attachmentUrl: true }))}
            className={`w-full mt-1 rounded-md border bg-white px-3 py-2 text-black focus:ring-teal-500 focus:border-teal-500 ${
              touched["attachmentUrl"] && !attachOk ? "border-rose-400" : "border-gray-300"
            }`}
            placeholder="https://… (PDF, Google Drive, etc.)"
            inputMode="url"
          />
          <p className="mt-1 text-xs text-gray-500">Optional. Paste a valid http(s) link.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Expires On</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, expiresAt: true }))}
            className={`w-full mt-1 rounded-md border bg-white px-3 py-2 text-black focus:ring-teal-500 focus:border-teal-500 ${
              touched["expiresAt"] && !dateOk ? "border-rose-400" : "border-gray-300"
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional. Expired notices are hidden from the student view.
          </p>
        </div>
      </div>

      {/* Pin */}
      <div className="flex items-center gap-2">
        <input
          id="pinned"
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 text-teal-600 border-gray-300 rounded"
        />
        <label htmlFor="pinned" className="text-sm text-gray-700">
          Pin to top
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isValid}
          className="px-4 py-2 rounded-md bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold disabled:opacity-50"
        >
          {initial?.id ? "Save changes" : "Publish notice"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-black"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}