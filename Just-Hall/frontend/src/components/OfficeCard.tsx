// src/components/OfficeCard.tsx
"use client";
import React from "react";
import type { OfficeBase, Staff } from "../lib/office";

interface OfficeCardProps {
  office: OfficeBase;
  staff?: Staff[];
}

export default function OfficeCard({ office, staff }: OfficeCardProps) {
  const { title, icon, contact, location, hours, note } = office;

  return (
    <article
      role="region"
      aria-label={title}
      className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition hover:-translate-y-0.5 p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="text-3xl rounded-xl p-2 bg-white ring-2 ring-cyan-200/70 shadow-sm"
            aria-hidden="true"
          >
            {icon ?? "🏷️"}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {note ? (
              <p className="text-xs text-slate-500 mt-0.5">{note}</p>
            ) : null}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex shrink-0 gap-2">
          {contact?.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700"
            >
              Call
            </a>
          )}
          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-300"
            >
              Email
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 grid gap-3 text-sm text-slate-700">
        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-700 font-medium">
            Contact
          </p>
          <ul className="mt-1 space-y-0.5">
            {contact?.phone && (
              <li>
                <span className="text-slate-500">Phone: </span>
                <a className="text-cyan-700 hover:underline" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              </li>
            )}
            {contact?.email && (
              <li>
                <span className="text-slate-500">Email: </span>
                <a className="text-cyan-700 hover:underline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-700 font-medium">
            Location
          </p>
          <p className="mt-1">
            {location.building}
            {location.floor ? ` · ${location.floor}` : ""}
            {location.room ? ` · ${location.room}` : ""}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-cyan-700 font-medium">
            Office Hours
          </p>
          <p className="mt-1">{hours}</p>
        </div>
      </div>

      {/* Staff table */}
      {staff?.length ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-cyan-700 font-medium">
            Staff
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Designation</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Contact</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {staff.map((s, i) => (
                  <tr key={i} className="border-t border-slate-200/70">
                    <td className="py-2 pr-4 font-medium text-slate-900">{s.name}</td>
                    <td className="py-2 pr-4 text-black font-medium">{s.designation}</td>
                    <td className="py-2 pr-4 text-black font-medium">{s.role}</td>

                    <td className="py-2 pr-4">
                      <div className="flex flex-col">
                        {s.phone && (
                          <a className="text-cyan-700 hover:underline" href={`tel:${s.phone}`}>
                            {s.phone}
                          </a>
                        )}
                        {s.email && (
                          <a className="text-cyan-700 hover:underline" href={`mailto:${s.email}`}>
                            {s.email}
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </article>
  );
}
