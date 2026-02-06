"use client";

import React, { useEffect, useState } from "react";

interface Application {
  id: number;
  fullName: string;
  studentId: string;
  department: string;
  session: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  householdIncome: number | null;
  paymentSlipNo: string;
  paymentSlipUrl: string | null;
  profilePhotoUrl: string | null;
  userId: string | null;
  password: string | null;
  status: string;
  vivaDate: string | null;
  vivaSerialNo: number | null;
  createdAt: string;
}

export default function ViewApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [vivaModalApp, setVivaModalApp] = useState<Application | null>(null);
  const [vivaDate, setVivaDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch applications.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`http://localhost:8000/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchApplications(); // refresh list
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status }); // update modal status
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const callForViva = async () => {
    if (!vivaModalApp || !vivaDate) {
      alert("Please select a viva date");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/applications/${vivaModalApp.id}/viva`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vivaDate, status: "Called for Viva" }),
      });
      if (!res.ok) throw new Error("Failed to schedule viva");
      fetchApplications(); // refresh list
      setVivaModalApp(null);
      setVivaDate("");
      alert("Viva scheduled successfully!");
    } catch (err) {
      console.error(err);
      alert("Error scheduling viva");
    }
  };

  // Filter applications based on selected status
  const filteredApplications = filterStatus === "All" 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 max-w-md">
          <div className="text-5xl mb-4 text-center">⚠️</div>
          <p className="text-center text-red-600 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-slate-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 rounded-t-2xl"></div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full flex items-center justify-center text-4xl border border-teal-400/30">
              📋
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800">All Applications</h1>
              <p className="text-gray-600 mt-1">Review and manage student hall applications</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
              <p className="text-teal-600 text-xs font-semibold uppercase tracking-wider">Total</p>
              <p className="text-3xl font-bold text-gray-800">{applications.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-yellow-600 text-xs font-semibold uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-bold text-gray-800">
                {applications.filter(a => a.status === "Pending").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Called for Viva</p>
              <p className="text-3xl font-bold text-gray-800">
                {applications.filter(a => a.status === "Called for Viva").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Approved</p>
              <p className="text-3xl font-bold text-gray-800">
                {applications.filter(a => a.status === "Approved").length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-600 text-xs font-semibold uppercase tracking-wider">Rejected</p>
              <p className="text-3xl font-bold text-gray-800">
                {applications.filter(a => a.status === "Rejected").length}
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus("All")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === "All"
                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              All Applications
            </button>
            <button
              onClick={() => setFilterStatus("Pending")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === "Pending"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("Called for Viva")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === "Called for Viva"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              Called for Viva
            </button>
            <button
              onClick={() => setFilterStatus("Approved")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === "Approved"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus("Rejected")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === "Rejected"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-xl">No applications found.</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-xl">No {filterStatus.toLowerCase()} applications found.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-300 border border-slate-200 hover:border-indigo-300 overflow-hidden cursor-pointer group"
                onClick={() => setSelectedApp(app)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {app.profilePhotoUrl ? (
                        <img
                          src={`http://localhost:8000${app.profilePhotoUrl.startsWith('/') ? app.profilePhotoUrl : '/media/' + app.profilePhotoUrl}`}
                          alt={app.fullName}
                          className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 group-hover:border-indigo-300 transition-all shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-indigo-200 group-hover:border-indigo-300 transition-all shadow-lg">
                          {app.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{app.fullName}</h3>
                        <p className="text-gray-600 font-medium">{app.studentId}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
                            📚 {app.department}
                          </span>
                          <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                            📅 {app.session}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm shadow-md ${
                          app.status === "Approved"
                            ? "bg-green-500 text-white"
                            : app.status === "Rejected"
                            ? "bg-red-500 text-white"
                            : app.status === "Called for Viva"
                            ? "bg-blue-500 text-white"
                            : "bg-yellow-400 text-gray-800"
                        }`}
                      >
                        {app.status === "Approved" && "✓"}
                        {app.status === "Rejected" && "✗"}
                        {app.status === "Pending" && "⏳"}
                        {app.status === "Called for Viva" && "📞"}
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-2 font-medium">
                        📅 {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.vivaDate && (
                        <div className="mt-1">
                          <p className="text-xs text-blue-600 font-bold">
                            🎓 Viva: {new Date(app.vivaDate).toLocaleDateString()}
                          </p>
                          {app.vivaSerialNo && (
                            <p className="text-xs text-indigo-600 font-bold mt-1">
                              #️⃣ Serial: {app.vivaSerialNo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-100">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📧</span>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                      </div>
                      <p className="text-sm text-gray-800 font-semibold truncate">{app.email}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📱</span>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Mobile</p>
                      </div>
                      <p className="text-sm text-gray-800 font-semibold">{app.mobile}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{app.gender === 'Male' ? '👨' : '👩'}</span>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Gender</p>
                      </div>
                      <p className="text-sm text-gray-800 font-semibold">{app.gender}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVivaModalApp(app);
                        setVivaDate("");
                      }}
                      disabled={app.status === "Approved" || app.status === "Rejected"}
                    >
                      📞 Call for Viva
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(app.id, "Approved");
                      }}
                      disabled={app.status === "Approved"}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-3 rounded-xl font-bold hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(app.id, "Rejected");
                      }}
                      disabled={app.status === "Rejected"}
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Detailed Modal */}
      {selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 relative border border-slate-200">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-t-2xl p-6 border-b border-slate-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 rounded-t-2xl"></div>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl transition-all"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
              <div className="flex items-center gap-4">
                {selectedApp.profilePhotoUrl ? (
                  <img
                    src={`http://localhost:8000${selectedApp.profilePhotoUrl.startsWith('/') ? selectedApp.profilePhotoUrl : '/media/' + selectedApp.profilePhotoUrl}`}
                    alt={selectedApp.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-400/50 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-indigo-400/50 shadow-lg">
                    {selectedApp.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedApp.fullName}</h2>
                  <p className="text-gray-600 text-lg font-medium">{selectedApp.studentId}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-indigo-100 px-3 py-1 rounded-full text-sm font-semibold text-indigo-700">
                      📚 {selectedApp.department}
                    </span>
                    <span className="bg-purple-100 px-3 py-1 rounded-full text-sm font-semibold text-purple-700">
                      📅 {selectedApp.session}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👤</span> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-indigo-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</p>
                    <p className="text-gray-800 font-medium">{selectedApp.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Student ID</p>
                    <p className="text-gray-800 font-medium">{selectedApp.studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</p>
                    <p className="text-gray-800 font-medium">{new Date(selectedApp.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</p>
                    <p className="text-gray-800 font-medium">{selectedApp.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</p>
                    <p className="text-gray-800 font-medium">{selectedApp.department}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Session</p>
                    <p className="text-gray-800 font-medium">{selectedApp.session}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📱</span> Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-gray-800 font-medium break-all">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</p>
                    <p className="text-gray-800 font-medium">{selectedApp.mobile}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="text-gray-800 font-medium">{selectedApp.address}</p>
                  </div>
                </div>
              </div>

              {/* Family Information */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👨‍👩‍👦</span> Family Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Father's Name</p>
                    <p className="text-gray-800 font-medium">{selectedApp.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Father's Occupation</p>
                    <p className="text-gray-800 font-medium">{selectedApp.fatherOccupation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mother's Name</p>
                    <p className="text-gray-800 font-medium">{selectedApp.motherName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mother's Occupation</p>
                    <p className="text-gray-800 font-medium">{selectedApp.motherOccupation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Household Income</p>
                    <p className="text-gray-800 font-medium">
                      {selectedApp.householdIncome ? `৳${selectedApp.householdIncome.toLocaleString()}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment & Documents */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💳</span> Payment & Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Slip No</p>
                    <p className="text-gray-800 font-medium">{selectedApp.paymentSlipNo}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Slip</p>
                    {selectedApp.paymentSlipUrl ? (
                      <a
                        href={`http://localhost:8000${selectedApp.paymentSlipUrl.startsWith('/') ? selectedApp.paymentSlipUrl : '/media/' + selectedApp.paymentSlipUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 hover:text-cyan-700 font-medium underline"
                      >
                        View Document
                      </a>
                    ) : (
                      <p className="text-gray-500">Not uploaded</p>
                    )}
                  </div>
                </div>

                {selectedApp.paymentSlipUrl && (
                  <div className="mt-4">
                    <img
                      src={`http://localhost:8000${selectedApp.paymentSlipUrl.startsWith('/') ? selectedApp.paymentSlipUrl : '/media/' + selectedApp.paymentSlipUrl}`}
                      alt="Payment Slip"
                      className="max-w-full h-auto rounded-xl border-2 border-cyan-500/30 shadow-lg"
                    />
                  </div>
                )}
              </div>

              {/* Tracking Credentials */}
              {selectedApp.userId && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔐</span> Tracking Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</p>
                      <p className="text-orange-700 font-medium">{selectedApp.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</p>
                      <p className="text-orange-700 font-medium font-mono">{selectedApp.password ? '••••••••' : "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Status */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span> Application Status
                </h3>
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Status</p>
                      <span
                        className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-lg mt-2 shadow-md ${
                          selectedApp.status === "Approved"
                            ? "bg-green-500 text-white"
                            : selectedApp.status === "Rejected"
                            ? "bg-red-500 text-white"
                            : selectedApp.status === "Called for Viva"
                            ? "bg-blue-500 text-white"
                            : "bg-yellow-400 text-gray-800"
                        }`}
                      >
                        {selectedApp.status === "Approved" && "✓"}
                        {selectedApp.status === "Rejected" && "✗"}
                        {selectedApp.status === "Pending" && "⏳"}
                        {selectedApp.status === "Called for Viva" && "📞"}
                        {selectedApp.status}
                      </span>
                      {selectedApp.vivaDate && (
                        <div className="mt-2">
                          <p className="text-blue-600 font-bold text-md">
                            🎓 Viva Date: {new Date(selectedApp.vivaDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {selectedApp.vivaSerialNo && (
                            <p className="text-indigo-600 font-bold text-md mt-1">
                              #️⃣ Serial Number: {selectedApp.vivaSerialNo}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted On</p>
                      <p className="text-gray-800 font-medium text-lg">
                        {new Date(selectedApp.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-2xl flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                onClick={() => updateStatus(selectedApp.id, "Approved")}
                disabled={selectedApp.status === "Approved"}
              >
                ✓ Approve Application
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                onClick={() => updateStatus(selectedApp.id, "Rejected")}
                disabled={selectedApp.status === "Rejected"}
              >
                ✗ Reject Application
              </button>
              <button
                className="px-6 py-3 bg-slate-200 text-gray-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viva Date Modal */}
      {vivaModalApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative border border-slate-200">
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-t-2xl p-6 border-b border-slate-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-t-2xl"></div>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center font-bold text-2xl transition-all"
                onClick={() => {
                  setVivaModalApp(null);
                  setVivaDate("");
                }}
              >
                ×
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white">
                  📞
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Schedule Viva</h2>
                  <p className="text-gray-600 text-sm">{vivaModalApp.fullName}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Viva Date
                </label>
                <input
                  type="date"
                  value={vivaDate}
                  onChange={(e) => setVivaDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none text-gray-800 font-medium"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">📧 Note:</span> An email notification will be sent to the student with the viva date and details.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                  onClick={callForViva}
                >
                  📞 Schedule Viva
                </button>
                <button
                  className="px-6 py-3 bg-slate-200 text-gray-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                  onClick={() => {
                    setVivaModalApp(null);
                    setVivaDate("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
