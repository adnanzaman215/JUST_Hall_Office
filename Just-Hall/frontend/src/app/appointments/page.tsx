"use client";
import React, { useState, useEffect } from "react";
import { appointmentsAPI, CreateAppointmentDTO, Appointment } from "@/lib/api";

// Provost contact information
const PROVOST_PHONE = "+880-1XXXXXXXXX";
const PROVOST_EMAIL = "provost@university.edu";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentDTO>({
    reason: "",
    additionalNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Please login to view appointments");
        return;
      }
      const data = await appointmentsAPI.getMy(token);
      setAppointments(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Please login to create an appointment");
      }
      await appointmentsAPI.create(formData, token);
      setShowModal(false);
      setFormData({ reason: "", additionalNotes: "" });
      fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Please login");
      await appointmentsAPI.delete(id, token);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Failed to cancel appointment");
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-black text-white">Provost Appointments</h1>
                <p className="text-cyan-50 text-xl font-medium mt-2">
                  Request and manage meetings with the Provost
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-all shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </button>
          </div>
          
          {/* Provost Contact Info */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
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

        {/* Stats */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8 mb-8">
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
            My Appointments
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="text-gray-600 mt-4 font-medium">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 font-bold text-lg">No appointments yet</p>
              <p className="text-gray-500 mt-2">Click "New Request" to schedule a meeting with the Provost</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2">{appointment.reason}</h3>
                      {appointment.additionalNotes && (
                        <p className="text-gray-700 font-medium mb-3">{appointment.additionalNotes}</p>
                      )}
                    </div>
                    {appointment.status === "Pending" && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-200 transition-all"
                      >
                        Cancel
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
      </div>

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-900">Request Appointment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  onClick={() => setShowModal(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}
