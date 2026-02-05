// src/components/OfficeCard.tsx
"use client";
import React from "react";
import Link from "next/link";
import type { OfficeBase, Staff } from "../lib/office";

interface OfficeCardProps {
  office: OfficeBase;
  staff?: Staff[];
}

export default function OfficeCard({ office, staff }: OfficeCardProps) {
  const { title, icon, contact, location, hours, note } = office;
  const isProvostOffice = (office as any).key === "provost";

  return (
    <article className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 hover:shadow-2xl transition-all duration-300 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 text-4xl shadow-md">
            {icon ?? "🏷️"}
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">{title}</h3>
            {note && (
              <p className="text-sm text-gray-600 mt-1 font-medium">{note}</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {isProvostOffice ? (
            <Link
              href="/appointments"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              📅 Book Appointment
            </Link>
          ) : (
            contact?.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
              >
                📞 Call
              </a>
            )
          )}
          {contact?.email && (
            <a
              href={`mailto:${contact.email}`}
              className="rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2.5 text-sm font-bold text-white hover:from-slate-700 hover:to-slate-800 transition-all shadow-md hover:shadow-lg"
            >
              ✉️ Email
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-5 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
          <p className="text-xs uppercase tracking-wide text-blue-800 font-black mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Contact Information
          </p>
          <ul className="space-y-2">
            {isProvostOffice ? (
              <li className="flex items-center gap-2">
                <span className="text-gray-600 font-bold text-sm">Appointments:</span>
                <Link href="/appointments" className="text-blue-700 hover:text-cyan-700 font-bold transition-colors underline">
                  Book an appointment to meet with the Provost
                </Link>
              </li>
            ) : (
              contact?.phone && (
                <li className="flex items-center gap-2">
                  <span className="text-gray-600 font-bold text-sm">Phone:</span>
                  <a className="text-blue-700 hover:text-cyan-700 font-bold transition-colors" href={`tel:${contact.phone}`}>
                    {contact.phone}
                  </a>
                </li>
              )
            )}
            {contact?.email && (
              <li className="flex items-center gap-2">
                <span className="text-gray-600 font-bold text-sm">Email:</span>
                <a className="text-blue-700 hover:text-cyan-700 font-bold transition-colors break-all" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-200">
          <p className="text-xs uppercase tracking-wide text-purple-800 font-black mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Location
          </p>
          <p className="text-gray-900 font-bold">
            {location.building}
            {location.floor && <span className="text-purple-700"> · {location.floor}</span>}
            {location.room && <span className="text-purple-700"> · {location.room}</span>}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
          <p className="text-xs uppercase tracking-wide text-green-800 font-black mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Office Hours
          </p>
          <p className="text-gray-900 font-bold">{hours}</p>
        </div>
      </div>

      {/* Staff table */}
      {staff?.length ? (
        <div className="border-t-2 border-blue-100 pt-6">
          <p className="text-xs uppercase tracking-wide text-blue-800 font-black mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Staff Members
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                  <th className="py-3 px-4 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Designation</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Role</th>
                  <th className="py-3 px-4 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Contact</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 font-bold text-gray-700">{s.designation}</td>
                    <td className="py-3 px-4 font-medium text-gray-600">{s.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {s.phone && (
                          <a className="text-blue-700 hover:text-cyan-700 font-bold text-sm transition-colors" href={`tel:${s.phone}`}>
                            {s.phone}
                          </a>
                        )}
                        {s.email && (
                          <a className="text-blue-700 hover:text-cyan-700 font-bold text-sm transition-colors break-all" href={`mailto:${s.email}`}>
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
