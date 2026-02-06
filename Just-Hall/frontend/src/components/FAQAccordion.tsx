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

  const categoryColors: Record<string, { bg: string; text: string; badge: string }> = {
    general: { bg: "bg-blue-50", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
    facilities: { bg: "bg-green-50", text: "text-green-600", badge: "bg-green-100 text-green-700" },
    support: { bg: "bg-purple-50", text: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
    payments: { bg: "bg-orange-50", text: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  };

  return (
    <section className="space-y-6">
      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
          🔍
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search FAQs by keyword, topic, or category..."
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 text-slate-900 placeholder-slate-400 shadow-sm transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {query ? (
            <>
              Found <span className="font-bold text-slate-900">{filtered.length}</span> result
              {filtered.length !== 1 ? "s" : ""} for "{query}"
            </>
          ) : (
            <>
              Showing <span className="font-bold text-slate-900">{filtered.length}</span> question
              {filtered.length !== 1 ? "s" : ""}
            </>
          )}
        </p>
        {Object.keys(openMap).filter(k => openMap[k]).length > 0 && (
          <button
            onClick={() => setOpenMap({})}
            className="text-sm font-medium text-purple-600 hover:text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
          >
            Collapse All
          </button>
        )}
      </div>

      {/* Accordion Items */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isOpen = !!openMap[item.id];
          const colors = categoryColors[item.categoryKey] || categoryColors.general;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border-2 transition-all ${
                isOpen 
                  ? "border-purple-300 shadow-lg bg-white" 
                  : "border-slate-200 shadow-sm bg-white hover:border-slate-300"
              }`}
            >
              <button
                className="flex w-full items-start justify-between gap-4 text-left p-5 sm:p-6"
                aria-expanded={isOpen}
                onClick={() => toggle(item.id)}
                type="button"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                      {item.categoryTitle}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {item.q}
                  </h3>
                </div>
                <div
                  className={`flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all ${
                    isOpen 
                      ? "rotate-180 bg-purple-100 border-purple-300 text-purple-700 shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0">
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <div className={`rounded-xl ${colors.bg} p-5 border-2 ${colors.bg.replace('50', '200')}`}>
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.badge} flex items-center justify-center text-sm font-bold`}>
                          A
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-700 flex-1">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-3xl mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No results found</h3>
            <p className="text-sm text-slate-600 mb-4">
              We couldn't find any FAQs matching "{query}". Try different keywords or browse all categories.
            </p>
            <button
              onClick={() => setQuery("")}
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
