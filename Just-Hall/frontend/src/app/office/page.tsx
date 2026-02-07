// src/app/office/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import OfficeCard from "../../components/OfficeCard";
import { officeSections } from "../../lib/office";
import { appointmentsAPI, UpdateAppointmentStatusDTO, Appointment } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

export default function OfficePage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isAdminOrStaff = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "staff";
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusForm, setStatusForm] = useState<UpdateAppointmentStatusDTO>({
    status: "",
    appointmentDate: "",
    appointmentTime: "",
    provostResponse: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("Pending");

  useEffect(() => {
      if (isAdminOrStaff) {
      fetchAppointments();
    }
    }, [isAdminOrStaff]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Please login to view appointments");
        return;
      }
      console.log("Fetching appointments with token:", token.substring(0, 20) + "...");
      const data = await appointmentsAPI.getAll(token);
      console.log("Appointments fetched:", data);
      setAppointments(data);
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Please login");

      await appointmentsAPI.updateStatus(selectedAppointment.id, statusForm, token);
      setShowModal(false);
      setSelectedAppointment(null);
      setStatusForm({
        status: "",
        appointmentDate: "",
        appointmentTime: "",
        provostResponse: "",
      });
      setSuccessMessage("Appointment updated successfully!");
      fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Failed to update appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setStatusForm({
      status: appointment.status,
      appointmentDate: appointment.appointmentDate?.split("T")[0] || "",
      appointmentTime: appointment.appointmentTime?.substring(0, 5) || "",
      provostResponse: appointment.provostResponse || "",
    });
    setShowModal(true);
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

  const filteredAppointments = filterStatus === "All" 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  const statusOptions = ["Pending", "Approved", "Rejected", "Completed", "All"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-5xl font-black text-white">Office Section</h1>
          </div>
          <p className="text-cyan-50 text-xl font-medium">
            Contact details, locations, and working hours for Provost and Staff Offices
          </p>
        </div>

        {/* Admin Appointment Management */}
          {isAdminOrStaff && (
          <div className="mb-8">
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Appointment Requests
                </h2>
                <button
                  onClick={fetchAppointments}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
                  <p className="text-green-800 font-bold">{successMessage}</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-800 font-bold">{error}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                  <div className="text-3xl font-black text-yellow-800">{appointments.filter(a => a.status === "Pending").length}</div>
                  <div className="text-yellow-700 font-bold text-sm">Pending</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-3xl font-black text-green-800">{appointments.filter(a => a.status === "Approved").length}</div>
                  <div className="text-green-700 font-bold text-sm">Approved</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                  <div className="text-3xl font-black text-red-800">{appointments.filter(a => a.status === "Rejected").length}</div>
                  <div className="text-red-700 font-bold text-sm">Rejected</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-3xl font-black text-blue-800">{appointments.filter(a => a.status === "Completed").length}</div>
                  <div className="text-blue-700 font-bold text-sm">Completed</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="text-3xl font-black text-purple-800">{appointments.length}</div>
                  <div className="text-purple-700 font-bold text-sm">Total</div>
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap mb-6">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${
                      filterStatus === status
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Appointments List */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
                  <p className="text-gray-600 mt-4 font-medium">Loading appointments...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-600 font-bold">No {filterStatus.toLowerCase()} appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <span className="text-gray-500 text-sm font-medium">#{appointment.id}</span>
                            <span className="text-gray-400 text-sm">Requested: {formatDate(appointment.requestedAt)}</span>
                          </div>
                          <h3 className="text-lg font-black text-gray-900 mb-2">{appointment.studentName}</h3>
                          <div className="text-sm text-gray-600 mb-3 space-y-1">
                            <p><span className="font-bold">Email:</span> {appointment.studentEmail}</p>
                            <p><span className="font-bold">Phone:</span> {appointment.studentPhone || "N/A"}</p>
                            <p><span className="font-bold">Reason:</span> {appointment.reason}</p>
                            {appointment.additionalNotes && (
                              <p><span className="font-bold">Notes:</span> {appointment.additionalNotes}</p>
                            )}
                          </div>
                          {appointment.status === "Approved" && appointment.appointmentDate && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-2">
                              <p className="text-xs font-black text-green-700 mb-1">Scheduled:</p>
                              <p className="text-sm font-bold text-green-900">
                                {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime?.substring(0, 5) || "N/A"}
                              </p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openModal(appointment)}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Office Cards */}
        <section className="grid gap-6 md:grid-cols-2">
          {officeSections
            .filter((sec) => {
              // Hide provost and staff office sections from admin view
              if (isAdmin && (sec.key === "provost" || sec.key === "staff-office")) {
                return false;
              }
              return true;
            })
            .map((sec) => (
              <OfficeCard key={sec.key} office={sec.office} staff={sec.staff} />
            ))}
        </section>
      </div>

      {/* Manage Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">Manage Appointment #{selectedAppointment.id}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Student Info */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-sm font-black text-blue-900 mb-3">Student Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-bold mb-1">Name</p>
                  <p className="text-gray-900 font-bold">{selectedAppointment.studentName}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-bold mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{selectedAppointment.studentEmail}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-bold mb-1">Phone</p>
                  <p className="text-gray-900 font-medium">{selectedAppointment.studentPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-bold mb-1">Requested</p>
                  <p className="text-gray-900 font-medium">{formatDate(selectedAppointment.requestedAt)}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-black text-gray-900 mb-3">Appointment Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 font-bold mb-1">Reason</p>
                  <p className="text-gray-900 font-medium">{selectedAppointment.reason}</p>
                </div>
                {selectedAppointment.additionalNotes && (
                  <div>
                    <p className="text-gray-600 font-bold mb-1">Additional Notes</p>
                    <p className="text-gray-700">{selectedAppointment.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Status *
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-bold text-sm"
                  required
                >
                  <option value="">Select status...</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {statusForm.status === "Approved" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      value={statusForm.appointmentDate}
                      onChange={(e) => setStatusForm({ ...statusForm, appointmentDate: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">
                      Appointment Time *
                    </label>
                    <input
                      type="time"
                      value={statusForm.appointmentTime}
                      onChange={(e) => setStatusForm({ ...statusForm, appointmentTime: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Response/Comments
                </label>
                <textarea
                  value={statusForm.provostResponse}
                  onChange={(e) => setStatusForm({ ...statusForm, provostResponse: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium h-24 resize-none text-sm"
                  placeholder="Provide feedback to the student..."
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  {submitting ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
