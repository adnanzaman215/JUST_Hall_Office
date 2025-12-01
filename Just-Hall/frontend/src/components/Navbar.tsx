// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useUI } from "@/context/ui-store";
import { useAuth } from "@/context/auth-context";
import { getFullMediaUrl } from "@/lib/utils";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { openSignup, openLogin } = useUI();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-[#0f2027] via-[#203a43] to-[#2c5364] px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Welcome Text */}
        <div className="text-lg font-semibold text-cyan-300">
          {isAuthenticated ? `Welcome, ${user?.full_name || user?.email}!` : "Welcome...!!"}
        </div>

        {/* Toggle button for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-cyan-300 hover:text-teal-300 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <div className={`md:flex gap-6 ${menuOpen ? "block" : "hidden"} md:block`}>
          <Link href="/" className="text-gray-200 hover:text-teal-300 transition">&gt; Home</Link>
          <Link href="/hall-portal" className="text-gray-200 hover:text-teal-300 transition">&gt; Hall Portal</Link>
          <Link href="/notice-board" className="text-gray-200 hover:text-teal-300 transition">&gt; Notice Board</Link>
          <Link href="/facilities" className="text-gray-200 hover:text-teal-300 transition">&gt; Facilities</Link>
          <Link href="/office" className="text-gray-200 hover:text-teal-300 transition">&gt; Office</Link>
          <Link href="/faq" className="text-gray-200 hover:text-teal-300 transition">&gt; FAQ</Link>
          <Link href="/contact" className="text-gray-200 hover:text-teal-300 transition">&gt; Contact Us</Link>
        </div>

        {/* Conditional Auth Buttons/Profile */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition"
            >
              {/* Profile Picture */}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {user?.student?.photo_url ? (
                  <img 
                    src={getFullMediaUrl(user.student.photo_url) || ''} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
              <span className="hidden md:block">{user?.full_name || 'Profile'}</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <div className="py-1">
                  <Link 
                    href="/my-profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={openLogin}
              className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition"
            >
              Login
            </button>
            <button 
              onClick={openSignup}
              className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition"
            >
              Sign Up
            </button>
          </div>
        )}

      </div>
    </nav>
  );
}
