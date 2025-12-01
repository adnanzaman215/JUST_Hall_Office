// src/app/notice-board/page.tsx
import NoticeBoardClient from "@/components/NoticeBoardClient";

export const metadata = { title: "Notice Board | JUST Hall" };

export default function NoticeBoardPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Gradient banner like Office section */}
      <section className="mb-6">
        <div className="rounded-3xl px-6 md:px-10 py-6 md:py-8 bg-gradient-to-r from-[#0f2027] via-[#0f5e73] to-[#0b7872] text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-3xl md:text-4xl leading-none">📢</div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Notice Board</h1>
              <p className="text-white/85 mt-1 md:mt-2">
                Students can read official notices. Admins can create and manage them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client shell handles admin gating */}
      <NoticeBoardClient />
    </main>
  );
}