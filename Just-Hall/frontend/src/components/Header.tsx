// components/Header.tsx
"use client";

export default function Header() {
  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-800">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      {/* Header Section */}
      <header className="relative max-w-7xl mx-auto flex items-center justify-between p-6 md:py-8 md:px-10">
        {/* University Logo and Title */}
        <div className="flex items-center gap-6">
          {/* Animated Logo Container - No Border */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative transform group-hover:scale-105 transition-transform duration-300">
              <img
                src="/university_logo.png"
                alt="University Logo"
                className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover shadow-2xl"
              />
            </div>
          </div>
          
          {/* Title Section */}
          <div className="space-y-1">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              Jashore University of Science & Technology
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"></div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Munshi Meherulla Hall
              </h2>
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1 hidden md:block">Excellence in Education & Residential Life</p>
          </div>
        </div>
      </header>
    </div>
  );
}
