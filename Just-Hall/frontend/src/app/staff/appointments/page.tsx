"use client";
import React, { useState, useEffect } from "react";
import { appointmentsAPI, UpdateAppointmentStatusDTO, Appointment } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusForm, setStatusForm] = useState<UpdateAppointmentStatusDTO>({
    status: "",
    appointmentDate: "",
    appointmentTime: "",
    provostResponse: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Please login to view appointments");
        return;
      }
      const data = await appointmentsAPI.getAll(token);
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load appointments");
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

  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return "Not set";
    return timeStr.substring(0, 5); // HH:mm
  };

  const filteredAppointments = filterStatus === "All" 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  const statusOptions = ["All", "Pending", "Approved", "Rejected", "Completed", "Cancelled"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black text-white">Manage Appointments</h1>
              <p className="text-cyan-50 text-xl font-medium mt-2">
                Review and schedule student appointments
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => router.back()}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
              <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-xl p-4 mb-4 mx-auto w-fit">
                <svg className="w-8 h-8 text-red-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-4xl font-black mb-2 text-gray-900">
                {appointments.filter(a => a.status === "Rejected").length}
              </div>
              <div className="text-gray-600 font-bold text-sm">Rejected</div>
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

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-3 flex-wrap">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
                  filterStatus === status
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
              <p className="text-gray-600 mt-4 font-medium">Loading appointments...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-bold">{error}</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-600 font-bold text-lg">No appointments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-black text-blue-900 uppercase tracking-wide">ID</th>
                    <th className="py-4 px-6 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Student</th>
                    <th className="py-4 px-6 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Reason</th>
                    <th className="py-4 px-6 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Status</th>
                    <th className="py-4 px-6 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Requested</th>
                    <th className="py-4 px-6 text-left text-xs font-black text-blue-900 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">#{appointment.id}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-black text-gray-900">{appointment.studentName}</p>
                          <p className="text-sm text-gray-600 font-medium">{appointment.studentEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 max-w-xs truncate">{appointment.reason}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-gray-700">{formatDate(appointment.requestedAt)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openModal(appointment)}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Manage Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-900">Manage Appointment #{selectedAppointment.id}</h2>
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
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
              <h3 className="text-lg font-black text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Name</p>
                  <p className="font-black text-gray-900">{selectedAppointment.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Email</p>
                  <p className="font-bold text-gray-700">{selectedAppointment.studentEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Phone</p>
                  <p className="font-bold text-gray-700">{selectedAppointment.studentPhone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Requested</p>
                  <p className="font-bold text-gray-700">{formatDate(selectedAppointment.requestedAt)}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Appointment Details</h3>
              <div>
                <p className="text-xs text-gray-600 font-bold mb-2">Reason</p>
                <p className="font-bold text-gray-900 mb-4">{selectedAppointment.reason}</p>
              </div>
              {selectedAppointment.additionalNotes && (
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-2">Additional Notes</p>
                  <p className="font-medium text-gray-700">{selectedAppointment.additionalNotes}</p>
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Status *
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-bold"
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

              {(statusForm.status === "Approved") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">
                        Appointment Date *
                      </label>
                      <input
                        type="date"
                        value={statusForm.appointmentDate}
                        onChange={(e) => setStatusForm({ ...statusForm, appointmentDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium"
                        required={statusForm.status === "Approved"}
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
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium"
                        required={statusForm.status === "Approved"}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-black text-gray-900 mb-2">
                  Response/Comments
                </label>
                <textarea
                  value={statusForm.provostResponse}
                  onChange={(e) => setStatusForm({ ...statusForm, provostResponse: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none font-medium h-32 resize-none"
                  placeholder="Provide feedback to the student..."
                  maxLength={500}
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
