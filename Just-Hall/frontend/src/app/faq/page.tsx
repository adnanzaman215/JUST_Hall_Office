"use client";
import React from "react";
import FAQAccordion from "../../components/FAQAccordion";
import { faqCategories } from "../../lib/faq";

export default function FAQPage() {
  return (
    <main className="max-w-7xl mx-auto px-5 py-10">
      {/* Hero */}
      <section className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">❓ Frequently Asked Questions</h1>
        <p className="mt-2 text-sky-100 max-w-2xl">
          Quick answers about hall seats, facilities, support services, and payments.
        </p>
      </section>

      {/* Accordion */}
      <FAQAccordion categories={faqCategories} />
    </main>
  );
}
