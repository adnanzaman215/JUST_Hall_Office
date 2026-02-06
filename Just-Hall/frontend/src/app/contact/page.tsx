"use client";
import React from "react";
import ContactUsForm from "@/components/ContactUsForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <span className="text-2xl">📞</span>
            <span className="text-sm font-medium">Support Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Get in Touch</h1>
          <p className="text-lg text-blue-50 max-w-2xl leading-relaxed">
            Have questions or need assistance? Our team is here to help! Fill out the contact form below and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-5 border border-blue-200 shadow-sm">
          <div className="text-3xl mb-2">⏰</div>
          <h3 className="text-sm font-medium text-blue-900 mb-1">Response Time</h3>
          <p className="text-2xl font-bold text-blue-600">24 Hours</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-5 border border-green-200 shadow-sm">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-sm font-medium text-green-900 mb-1">Satisfaction Rate</h3>
          <p className="text-2xl font-bold text-green-600">98%</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-5 border border-purple-200 shadow-sm">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-sm font-medium text-purple-900 mb-1">Issues Resolved</h3>
          <p className="text-2xl font-bold text-purple-600">1000+</p>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 p-5 border border-orange-200 shadow-sm">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-sm font-medium text-orange-900 mb-1">Support Staff</h3>
          <p className="text-2xl font-bold text-orange-600">24/7</p>
        </div>
      </section>

      {/* Content */}
      <section className="min-h-[500px]">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h2>
              <p className="text-slate-600">Fill out the form below and our team will get back to you within 24 hours.</p>
            </div>
            <ContactUsForm />
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}