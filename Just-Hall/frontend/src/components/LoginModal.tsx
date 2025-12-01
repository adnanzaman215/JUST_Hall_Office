"use client";
import React, { useState } from "react";
import { useUI } from "../context/ui-store";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { validateEmail } from "../lib/auth";

export default function LoginModal() {
  const { isLoginOpen, closeLogin, openSignup } = useUI();
  const { login } = useAuth();
  const router = useRouter();

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // login submit handler
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (!validateEmail(email)) {
        setError("Please enter a valid email address.");
        return;
      }

      // Call authentication context login
      await login(email, password);
      
      // Close modal and redirect to home
      closeLogin();
      router.push("/");
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle create account link
  function handleCreateAccount() {
    closeLogin();
    openSignup();
  }

  // Handle forgot password
  async function handleForgotPassword() {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      // For now, just show an alert - can implement proper forgot password later
      alert("Password reset feature will be implemented soon!");
    } catch (err) {
      setError("Failed to send password reset email. Please try again.");
    }
  }

  if (!isLoginOpen) return null;

  return (
    <>
      {/* Backdrop with blur + dim */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeLogin}
      />
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Student Login"
      >
        <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl">
          {/* Left pane – brand/visual */}
          <div className="relative hidden md:block bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 text-white p-8">
            <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center mix-blend-overlay opacity-50" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold">Welcome Back!</h2>
              <p className="mt-2 text-white/85">
                Sign in to access your hall portal and manage your account.
              </p>
              <p className="mt-10 text-xs text-white/70">
                Access your dashboard, notices, and hall services.
              </p>
            </div>
          </div>

          {/* Right pane – form */}
          <div className="bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              {/* Profile icon */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Log In</h3>
              </div>
              <button
                onClick={closeLogin}
                type="button"
                className="rounded-full border p-1.5 text-slate-500 hover:bg-slate-50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                  placeholder="your.email@university.edu"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error ? (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? "Signing in..." : "Log In"}
                </button>
              </div>
            </form>

            {/* Links below login form */}
            <div className="mt-6 space-y-3 text-center">
              <button
                onClick={handleCreateAccount}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-200"
              >
                Create Account
              </button>
              <div className="text-slate-400">•</div>
              <button
                onClick={handleForgotPassword}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
