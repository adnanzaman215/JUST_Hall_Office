// components/Header.tsx
"use client";

export default function Header() {
  return (
    <div className="bg-gradient-to-r from-cyan-50 via-white to-teal-50">
      {/* Header Section */}
      <header className="flex items-center justify-between p-6 md:p-8 shadow-md">
        {/* University Logo and Title */}
        <div className="flex items-center gap-6">
          <div className="rounded-full p-2 bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg">
            <img
              src="/university_logo.png"
              alt="University Logo"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white p-2"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 drop-shadow-sm">
              Jashore University of Science & Technology
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-600">
              Munshi Meherulla Hall
            </h2>
          </div>
        </div>
      </header>
    </div>
  );
}
