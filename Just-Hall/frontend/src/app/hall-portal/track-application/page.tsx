"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrackApplicationPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setApplicationData(null);

    if (!userId || !password) {
      setError("⚠️ Please enter both User ID and Password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/api/applications/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserId: userId,
          Password: password,
        }),
      });

      const contentType = res.headers.get("content-type");
      
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch application");
        } else {
          const errorText = await res.text();
          console.error("Non-JSON error response:", errorText);
          throw new Error("Server error. Please make sure the backend is running.");
        }
      }

      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await res.text();
        console.error("Non-JSON response:", responseText);
        throw new Error("Invalid response from server. Please try again.");
      }

      const data = await res.json();
      setApplicationData(data);
    } catch (err: any) {
      console.error("Track application error:", err);
      setError(err.message || "Invalid credentials or application not found.");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "called for viva":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "pending":
        return "⏳";
      case "called for viva":
        return "📞";
      default:
        return "📋";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-5">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Track Your Application
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-600 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Enter your tracking credentials to view your application status and details.
          </p>
        </section>

        {!applicationData ? (
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200">
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                  🔍
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  placeholder="Enter your User ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  placeholder="Enter your Password"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/hall-portal")}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Back to Portal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Tracking...
                    </>
                  ) : (
                    <>
                      Track Application
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Application Status</h2>
                  <p className="text-sm text-gray-500 mt-1">Student ID: {applicationData.studentId}</p>
                </div>
                <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg flex items-center gap-2 ${getStatusColor(applicationData.status)}`}>
                  <span className="text-2xl">{getStatusIcon(applicationData.status)}</span>
                  {applicationData.status}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Full Name</p>
                  <p className="text-lg text-gray-900">{applicationData.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Department</p>
                  <p className="text-lg text-gray-900">{applicationData.department}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Session</p>
                  <p className="text-lg text-gray-900">{applicationData.session}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Email</p>
                  <p className="text-lg text-gray-900">{applicationData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Mobile</p>
                  <p className="text-lg text-gray-900">{applicationData.mobile}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Applied On</p>
                  <p className="text-lg text-gray-900">
                    {new Date(applicationData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Viva Date Section - Only shown when status is Called for Viva */}
              {applicationData.vivaDate && applicationData.status === "Called for Viva" && (
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
                        🎓
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-900">Viva Schedule</h3>
                        <p className="text-sm text-blue-700">You have been called for viva!</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-semibold text-gray-500 mb-1">📅 Viva Date</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {new Date(applicationData.vivaDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long'
                        })}
                      </p>
                      {applicationData.vivaSerialNo && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm font-semibold text-gray-500 mb-1">#️⃣ Your Serial Number</p>
                          <p className="text-3xl font-bold text-indigo-600">
                            {applicationData.vivaSerialNo}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-3">
                        📧 Please check your email for detailed instructions and timing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setApplicationData(null);
                  setUserId("");
                  setPassword("");
                }}
                className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Track Another Application
              </button>
              <button
                onClick={() => router.push("/hall-portal")}
                className="flex-1 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back to Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
