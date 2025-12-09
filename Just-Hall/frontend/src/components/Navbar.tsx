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
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-800 via-slate-800 to-gray-800 backdrop-blur-lg border-b-2 border-teal-500/30 shadow-2xl shadow-teal-500/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Welcome Text */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="h-8 w-1 bg-gradient-to-b from-teal-400 to-cyan-600 rounded-full"></div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Welcome Back</p>
                <p className="text-sm font-semibold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  {isAuthenticated ? user?.fullName || user?.email : "Guest User"}
                </p>
              </div>
            </div>
            <div className="md:hidden text-sm font-semibold text-cyan-300">
              {isAuthenticated ? user?.fullName?.split(' ')[0] : "Menu"}
            </div>
          </div>

          {/* Navigation links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/" label="Home" />
            <NavLink href="/hall-portal" label="Hall Portal" />
            <NavLink href="/notice-board" label="Notices" />
            <NavLink href="/facilities" label="Facilities" />
            <NavLink href="/office" label="Office" />
            <NavLink href="/faq" label="FAQ" />
            <NavLink href="/contact" label="Contact" />
          </div>

          {/* Right Section: Auth Buttons/Profile & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-gray-800 transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Auth Buttons/Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 group"
                >
                  {/* Profile Picture */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-white/60 transition-all">
                    {user?.student?.photoUrl ? (
                      <img 
                        src={getFullMediaUrl(user.student.photoUrl) || ''} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{user?.fullName?.split(' ')[0] || 'Profile'}</span>
                  <svg className="w-4 h-4 transition-transform" style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 bg-gradient-to-r from-teal-600 to-cyan-600 border-b border-gray-700">
                      <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                      <p className="text-xs text-cyan-100">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link 
                        href="/my-profile" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-cyan-300 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-cyan-300 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={openLogin}
                  className="px-4 py-2 text-sm font-medium text-cyan-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  Login
                </button>
                <button 
                  onClick={openSignup}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-1">
              <MobileNavLink href="/" label="Home" onClick={() => setMenuOpen(false)} />
              <MobileNavLink href="/hall-portal" label="Hall Portal" onClick={() => setMenuOpen(false)} />
              <MobileNavLink href="/notice-board" label="Notices" onClick={() => setMenuOpen(false)} />
              <MobileNavLink href="/facilities" label="Facilities" onClick={() => setMenuOpen(false)} />
              <MobileNavLink href="/office" label="Office" onClick={() => setMenuOpen(false)} />
              <MobileNavLink href="/faq" label="FAQ" onClick={() => setMenuOpen(false)} />
              <MobileNavLink href="/contact" label="Contact" onClick={() => setMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// NavLink Component for Desktop
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href}
      className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-cyan-300 transition-colors group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
}

// MobileNavLink Component
function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-cyan-300 hover:bg-gray-800 rounded-lg transition-all"
    >
      {label}
    </Link>
  );
}
