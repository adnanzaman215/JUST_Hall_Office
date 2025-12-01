"use client";
import React from "react";
import type { FAQCategory } from "../lib/faq";

type Props = { categories: FAQCategory[] };

export default function FAQAccordion({ categories }: Props) {
  const [query, setQuery] = React.useState("");
  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({});

  const allItems = React.useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.items.map((item, i) => ({
          ...item,
          categoryKey: cat.key,
          categoryTitle: cat.title,
          id: `${cat.key}-${i}`,
        }))
      ),
    [categories]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (it) =>
        it.q.toLowerCase().includes(q) ||
        it.a.toLowerCase().includes(q) ||
        it.categoryTitle.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  function toggle(id: string) {
    setOpenMap((m) => ({ ...m, [id]: !m[id] }));
  }

  return (
    <section className="space-y-6">
      {/* Search */}
      <div className="relative w-full sm:max-w-md">
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs…"
          className="w-full rounded-xl border border-gray-300 bg-white/90 backdrop-blur px-9 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 text-black placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Stats */}
      <p className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{" "}
        <span className="font-semibold text-slate-700">{allItems.length}</span> FAQs
      </p>

      {/* Accordion */}
      <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur">
        {filtered.map((item) => {
          const isOpen = !!openMap[item.id];
          return (
            <div key={item.id} className="p-4 sm:p-5">
              <button
                className="flex w-full items-start justify-between gap-4 text-left"
                aria-expanded={isOpen}
                onClick={() => toggle(item.id)}
                type="button"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-cyan-600 font-medium">
                    {item.categoryTitle}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-slate-900">
                    {item.q}
                  </h3>
                </div>
                <span
                  className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border text-slate-600 transition ${
                    isOpen ? "rotate-180 bg-cyan-50 border-cyan-200" : "bg-white"
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                className={`grid overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0">
                  <p className="text-sm leading-6 text-slate-700">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">
            No results found. Try a different keyword.
          </div>
        )}
      </div>
    </section>
  );
}
