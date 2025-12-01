import ContactUsForm from "@/components/ContactUsForm";

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-5 py-10">
      {/* Hero Section - Following Office Design */}
      <section className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">📞 Contact Us</h1>
        <p className="mt-2 text-sky-100 max-w-2xl">
          Have questions or need assistance? We're here to help! Reach out to us using the form below 
          or through our contact information.
        </p>
      </section>

      {/* Content Grid - Following Office Layout */}
      <section className="grid gap-6 lg:grid-cols-2">
        
        {/* Contact Information Card */}
        <article
          role="region"
          aria-label="Contact Information"
          className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition hover:-translate-y-0.5 p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="text-3xl rounded-xl p-2 bg-white ring-2 ring-cyan-200/70 shadow-sm"
                aria-hidden="true"
              >
                📍
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Get in Touch</h3>
                <p className="text-xs text-slate-500 mt-0.5">Primary contact information for assistance</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex shrink-0 gap-2">
              <a
                href="tel:+15551234567"
                className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700"
              >
                Call
              </a>
              <a
                href="mailto:contact@universityhall.edu"
                className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-300"
              >
                Email
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-cyan-600 uppercase tracking-wide">CONTACT</h4>
              <p className="text-sm text-slate-700">Phone: +1 (555) 123-4567</p>
              <p className="text-sm text-slate-700">Email: contact@universityhall.edu</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-cyan-600 uppercase tracking-wide">LOCATION</h4>
              <p className="text-sm text-slate-700">University Hall · Main Building · Ground Floor · Room 101</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-cyan-600 uppercase tracking-wide">OFFICE HOURS</h4>
              <p className="text-sm text-slate-700">Monday – Friday, 9:00 AM – 5:00 PM</p>
              <p className="text-sm text-slate-700">Saturday, 10:00 AM – 2:00 PM</p>
              <p className="text-sm text-slate-700">Sunday: Closed</p>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-1">Emergency Contact</h4>
              <p className="text-xs text-red-700 mb-2">For urgent matters outside office hours:</p>
              <p className="text-sm font-medium text-red-800">Emergency: +1 (555) 911-HELP</p>
            </div>
          </div>
        </article>

        {/* Contact Form Card */}
        <article
          role="region"
          aria-label="Contact Form"
          className="rounded-2xl border border-white/40 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition hover:-translate-y-0.5 p-5"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="text-3xl rounded-xl p-2 bg-white ring-2 ring-cyan-200/70 shadow-sm"
              aria-hidden="true"
            >
              ✉
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Send us a Message</h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill out the form below and we'll get back to you</p>
            </div>
          </div>

          <ContactUsForm />
        </article>

      </section>
    </main>
  );
}