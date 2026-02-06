// src/components/NoticeCard.tsx
"use client";

import { useState } from "react";
import { Notice } from "../lib/notices";

export default function NoticeCard({
  notice,
  onEdit,
  onDelete,
}: {
  notice: Notice;
  onEdit?: (n: Notice) => void;
  onDelete?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();

  return (
    <article
      className={`relative border rounded-2xl p-5 shadow-sm transition hover:shadow-md bg-white/80 ${
        isExpired ? "opacity-70" : ""
      }`}
    >
      {notice.pinned && (
        <span className="absolute -top-2 -left-2 bg-amber-400 text-black text-xs font-semibold px-2 py-1 rounded-full shadow">
          Pinned
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className="mt-1 h-3 w-3 rounded-full bg-teal-500" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border">
              {notice.category}
            </span>
            {notice.expiresAt && (
              <span className="text-xs text-gray-500">
                Expires: {new Date(notice.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className={`mt-2 text-gray-700 ${expanded ? "" : "line-clamp-2"}`}>
            {notice.body}
          </p>
          {notice.attachmentUrl && (
            <a
              className="inline-block mt-3 text-sm text-teal-600 underline"
              href={notice.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View attachment
            </a>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div>
              By <span className="font-medium text-gray-700">{notice.author}</span> •{" "}
              {new Date(notice.createdAt).toLocaleString()}
              {notice.updatedAt && <> • Updated {new Date(notice.updatedAt).toLocaleString()}</>}
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  className="px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => onEdit(notice)}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50"
                  onClick={() => onDelete(notice.id)}
                >
                  Delete
                </button>
              )}
              <button
                className="px-2 py-1 rounded text-teal-700 hover:bg-teal-50"
                onClick={() => setExpanded((s) => !s)}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}