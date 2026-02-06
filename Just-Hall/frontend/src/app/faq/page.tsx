"use client";
import React, { useState } from "react";
import FAQAccordion from "../../components/FAQAccordion";
import { faqCategories } from "../../lib/faq";

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const totalQuestions = faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  const filteredCategories = selectedCategory
    ? faqCategories.filter(cat => cat.key === selectedCategory)
    : faqCategories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <span className="text-2xl">❓</span>
            <span className="text-sm font-medium">Knowledge Base</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-purple-50 max-w-2xl leading-relaxed">
            Find quick answers to common questions about hall seats, facilities, support services, and payments.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {faqCategories.map((category) => {
          const icons: Record<string, string> = {
            general: "🎓",
            facilities: "🏢",
            support: "🤝",
            payments: "💳"
          };
          
          const colors: Record<string, string> = {
            general: "from-blue-50 to-blue-100 border-blue-200",
            facilities: "from-green-50 to-green-100 border-green-200",
            support: "from-purple-50 to-purple-100 border-purple-200",
            payments: "from-orange-50 to-orange-100 border-orange-200"
          };

          const textColors: Record<string, string> = {
            general: "text-blue-600",
            facilities: "text-green-600",
            support: "text-purple-600",
            payments: "text-orange-600"
          };

          return (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(selectedCategory === category.key ? null : category.key)}
              className={`rounded-xl bg-gradient-to-br p-5 border shadow-sm hover:shadow-md transition-all text-left ${
                colors[category.key]
              } ${selectedCategory === category.key ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
            >
              <div className="text-3xl mb-2">{icons[category.key]}</div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">{category.title}</h3>
              <p className={`text-2xl font-bold ${textColors[category.key]}`}>
                {category.items.length} FAQs
              </p>
            </button>
          );
        })}
      </section>

      {/* Filter Info */}
      {selectedCategory && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔍</span>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Filtered by: <span className="text-purple-600 font-bold">
                  {faqCategories.find(cat => cat.key === selectedCategory)?.title}
                </span>
              </p>
              <p className="text-xs text-slate-600">
                Showing {filteredCategories[0]?.items.length || 0} of {totalQuestions} questions
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-sm font-medium text-purple-600 hover:text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Quick Help Banner */}
      <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              💡
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Can't find what you're looking for?</h3>
              <p className="text-blue-50 text-sm">Our support team is here to help you with any questions.</p>
            </div>
          </div>
          <a
            href="/contact"
            className="flex-shrink-0 bg-white text-blue-600 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition shadow-lg"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* FAQ Accordion */}
      <FAQAccordion categories={filteredCategories} />

      {/* Bottom CTA */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 text-3xl mb-4">
            📚
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Still have questions?</h2>
          <p className="text-slate-600 mb-6">
            Explore our knowledge base or reach out to our support team for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              <span>📧</span>
              Contact Us
            </a>
            <a
              href="/appointments"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-medium px-6 py-3 rounded-lg hover:bg-slate-200 transition"
            >
              <span>📅</span>
              Book Appointment
            </a>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
