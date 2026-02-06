"use client";
import React, { useState, useEffect } from "react";
import { appointmentsAPI, CreateAppointmentDTO, Appointment, authAPI } from "@/lib/api";

// Provost contact information
const PROVOST_PHONE = "+880-1XXXXXXXXX";
const PROVOST_EMAIL = "provost@university.edu";

interface PublicAppointmentForm {
  fullName: string;
  studentId: string;
  email: string;
  mobile: string;
  department: string;
  reason: string;
  additionalNotes: string;
}

interface LocalAppointment {
  id: string;
  fullName: string;
  studentId: string;
  email: string;
  mobile: string;
  department: string;
  reason: string;
  additionalNotes: string;
  status: string;
  requestedAt: string;
  isLocal: boolean;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [localAppointments] = useState<LocalAppointment[]>([]);
  const [formData, setFormData] = useState<PublicAppointmentForm>({
    fullName: "",
    studentId: "",
    email: "",
    mobile: "",
    department: "",
    reason: "",
    additionalNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check if user is logged in and load their appointments
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
      loadServerAppointments(token);
      loadUserProfile(token);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const loadUserProfile = async (token: string) => {
    try {
      const profile = await authAPI.getProfile(token);
      if (profile && profile.user) {
        // Auto-fill form with user data
        setFormData(prev => ({
          ...prev,
          fullName: profile.user.fullName || prev.fullName,
          studentId: profile.user.studentId || prev.studentId,
          email: profile.user.email || prev.email,
          department: profile.user.department || prev.department,
          mobile: profile.student?.mobileNumber || prev.mobile,
        }));
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  const loadServerAppointments = async (token: string) => {
    try {
      setLoading(true);
      const data = await appointmentsAPI.getMy(token);
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load server appointments:", err);
    } finally {
      setLoading(false);
    }
  };



  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      // Validate required fields
      if (!formData.reason.trim()) {
        setError("Please provide a reason for the appointment");
        setSubmitting(false);
        return;
      }

      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        setError("Please login to submit appointment request");
        setSubmitting(false);
        return;
      }

      // Create appointment via API
      await appointmentsAPI.create(
        {
          reason: formData.reason,
          additionalNotes: formData.additionalNotes,
        },
        token
      );
      setSuccessMessage("Appointment request submitted successfully! You'll be notified once it's reviewed.");
      await loadServerAppointments(token);
      
      // Clear only reason and notes, keep user info
      setFormData(prev => ({
        ...prev,
        reason: "",
        additionalNotes: "",
      }));

      setShowRequestModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to submit appointment request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Please login to check your appointment status");
        return;
      }

      await loadServerAppointments(token);
      setShowStatusModal(false);
      setSuccessMessage("Appointments loaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
    }
  };

  const handleCancel = async (id: number, status: string) => {
    // Only allow deletion if status is Approved or Rejected
    if (status === "Pending") {
      setError("Cannot delete pending appointments. Please wait for admin response.");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Please login to delete appointment");
        return;
      }
      await appointmentsAPI.delete(id, token);
      await loadServerAppointments(token);
      setSuccessMessage("Appointment deleted successfully");
    } catch (err: any) {
      setError(err.message || "Failed to delete appointment");
    }
  };



  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Approved: "bg-green-100 text-green-800 border-green-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
      Completed: "bg-blue-100 text-blue-800 border-blue-300",
      Cancelled: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return "Not set";
    return timeStr.substring(0, 5); // HH:mm
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-white">Provost Appointments</h1>
                <p className="text-cyan-50 text-lg lg:text-xl font-medium mt-2">
                  Request and manage meetings with the Provost
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const token = localStorage.getItem("auth_token");
                  if (!token) {
                    setError("Please login to request an appointment");
                    return;
                  }
                  setShowRequestModal(true);
                }}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Request
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="bg-white/20 text-white border-2 border-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-white/30 transition-all shadow-lg flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Check Status
              </button>
            </div>
          </div>
          
          {/* Provost Contact Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Need Urgent Help? Contact Provost Office
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${PROVOST_PHONE}`}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {PROVOST_PHONE}
              </a>
              <a
                href={`mailto:${PROVOST_EMAIL}`}
                className="bg-white/20 text-white border-2 border-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {PROVOST_EMAIL}
              </a>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-bold">{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-600 hover:text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-bold">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* How to Request */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6 hover:shadow-2xl transition-all">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 w-fit mb-4">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">How to Request</h3>
            <ol className="space-y-2 text-gray-700 font-medium text-sm">
              <li className="flex gap-2">
                <span className="font-black text-blue-700">1.</span>
                <span>Click "New Request" button</span>
              </li>
              <li className="flex gap-2">
                <span className="font-black text-blue-700">2.</span>
                <span>Fill in your details and reason</span>
              </li>
              <li className="flex gap-2">
                <span className="font-black text-blue-700">3.</span>
                <span>Submit your appointment request</span>
              </li>
              <li className="flex gap-2">
                <span className="font-black text-blue-700">4.</span>
                <span>Login later to track status updates</span>
              </li>
            </ol>
          </div>

          {/* Track Status */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-green-100 p-6 hover:shadow-2xl transition-all">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 w-fit mb-4">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">Track Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-gray-700 font-bold">Pending:</span>
                <span className="text-gray-600">Under review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-700 font-bold">Approved:</span>
                <span className="text-gray-600">Date & time set</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-700 font-bold">Completed:</span>
                <span className="text-gray-600">Meeting done</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-700 font-bold">Rejected:</span>
                <span className="text-gray-600">Cannot proceed</span>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100 p-6 hover:shadow-2xl transition-all">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-4 w-fit mb-4">
              <svg className="w-8 h-8 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-3">Important Notes</h3>
            <ul className="space-y-2 text-gray-700 font-medium text-sm">
              <li className="flex gap-2">
                <span className="text-purple-700 font-black">•</span>
                <span>Response within 24-48 hours</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-700 font-black">•</span>
                <span>Check your email for updates</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-700 font-black">•</span>
                <span>Can delete after approved/rejected</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-700 font-black">•</span>
                <span>Arrive 5 minutes early</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Appointments List (Only show if logged in and has appointments) */}
        {appointments.length > 0 && (
          <>
            {/* Stats */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8 mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Your Appointment Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4">
                  <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                    <svg className="w-8 h-8 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black mb-2 text-gray-900">
                    {appointments.filter(a => a.status === "Pending").length}
                  </div>
                  <div className="text-gray-600 font-bold text-sm">Pending</div>
                </div>
                <div className="text-center p-4">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                    <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black mb-2 text-gray-900">
                    {appointments.filter(a => a.status === "Approved").length}
                  </div>
                  <div className="text-gray-600 font-bold text-sm">Approved</div>
                </div>
                <div className="text-center p-4">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                    <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black mb-2 text-gray-900">
                    {appointments.filter(a => a.status === "Completed").length}
                  </div>
                  <div className="text-gray-600 font-bold text-sm">Completed</div>
                </div>
                <div className="text-center p-4">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                    <svg className="w-8 h-8 text-purple-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-4xl font-black mb-2 text-gray-900">{appointments.length}</div>
                  <div className="text-gray-600 font-bold text-sm">Total</div>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <svg className="w-7 h-7 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                My Appointments ({appointments.length})
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                  <p className="text-gray-600 mt-4 font-medium">Loading appointments...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display server appointments */}
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-black border-2 ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <span className="text-gray-500 text-sm font-medium">
                              Requested: {formatDate(appointment.requestedAt)}
                            </span>
                            {appointment.status === "Pending" && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                                Under Review - Cannot Delete
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-black text-gray-900 mb-2">{appointment.reason}</h3>
                          {appointment.additionalNotes && (
                            <p className="text-gray-700 font-medium mb-3">{appointment.additionalNotes}</p>
                          )}
                        </div>
                        {(appointment.status === "Approved" || appointment.status === "Rejected") && (
                          <button
                            onClick={() => handleCancel(appointment.id, appointment.status)}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-200 transition-all flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>

                      {appointment.status === "Approved" && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 mb-3">
                          <p className="text-sm font-black text-green-800 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Appointment Scheduled
                          </p>
                          <div className="flex gap-6">
                            <div>
                              <span className="text-xs text-green-700 font-bold">Date:</span>
                              <p className="text-green-900 font-black">{formatDate(appointment.appointmentDate)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-green-700 font-bold">Time:</span>
                              <p className="text-green-900 font-black">{formatTime(appointment.appointmentTime)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {appointment.provostResponse && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <p className="text-xs font-black text-blue-800 mb-1">Provost's Response:</p>
                          <p className="text-gray-900 font-bold">{appointment.provostResponse}</p>
                          {appointment.respondedByName && (
                            <p className="text-xs text-gray-600 font-medium mt-2">
                              — {appointment.respondedByName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Request Appointment Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-900">Request Appointment</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!localStorage.getItem("auth_token") ? (
              // Not logged in - show login prompt
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 text-center">
                <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xl font-black text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-700 font-medium mb-4">
                  Only logged-in students can request appointments. Please login or register to continue.
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-all"
                  >
                    Register
                  </a>
                </div>
              </div>
            ) : (

            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Reason for Appointment *
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium"
                  placeholder="e.g., Discussion about room allocation"
                  required
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium h-32 resize-none"
                  placeholder="Provide any additional details..."
                  maxLength={1000}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Check Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-900">Check Status</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
              <p className="text-green-800 font-bold text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Login to view your submitted appointments
              </p>
            </div>

            <form onSubmit={handleStatusCheck} className="space-y-4">
              <p className="text-gray-700 font-medium text-center mb-4">
                Your draft requests are already visible above. Login to see officially submitted appointments and their current status.
              </p>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Load My Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
