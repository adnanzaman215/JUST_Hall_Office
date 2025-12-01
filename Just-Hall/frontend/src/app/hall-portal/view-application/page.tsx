"use client";

import React, { useEffect, useState } from "react";

interface Application {
  id: number;
  full_name: string;
  student_id: string;
  department: string;
  session: string;
  dob: string;
  gender: string;
  payment_slip_no: string;
  mobile: string;
  email: string;
  address: string;
  status: string;
}

export default function ViewApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

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

  if (loading) return <p className="text-center mt-4">Loading applications...</p>;
  if (error) return <p className="text-center mt-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">All Applications</h1>

      {applications.length === 0 ? (
        <p className="text-center text-gray-500">No applications found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 shadow-sm rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Full Name</th>
                <th className="border px-4 py-2">Student ID</th>
                <th className="border px-4 py-2">Department</th>
                <th className="border px-4 py-2">Session</th>
                <th className="border px-4 py-2">Payment Slip</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td
                    className="border px-4 py-2 cursor-pointer text-blue-600 hover:underline"
                    onClick={() => setSelectedApp(app)}
                  >
                    {app.full_name}
                  </td>
                  <td className="border px-4 py-2">{app.student_id}</td>
                  <td className="border px-4 py-2">{app.department}</td>
                  <td className="border px-4 py-2">{app.session}</td>
                  <td className="border px-4 py-2">{app.payment_slip_no}</td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      app.status === "Approved" ? "text-green-600" :
                      app.status === "Rejected" ? "text-red-600" : "text-yellow-600"
                    }`}
                  >
                    {app.status}
                  </td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      onClick={() => updateStatus(app.id, "Approved")}
                      disabled={app.status === "Approved"}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      onClick={() => updateStatus(app.id, "Rejected")}
                      disabled={app.status === "Rejected"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-xl"
              onClick={() => setSelectedApp(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Full Name:</span> {selectedApp.full_name}</p>
              <p><span className="font-semibold">Student ID:</span> {selectedApp.student_id}</p>
              <p><span className="font-semibold">Department:</span> {selectedApp.department}</p>
              <p><span className="font-semibold">Session:</span> {selectedApp.session}</p>
              <p><span className="font-semibold">Date of Birth:</span> {selectedApp.dob}</p>
              <p><span className="font-semibold">Gender:</span> {selectedApp.gender}</p>
              <p><span className="font-semibold">Payment Slip No:</span> {selectedApp.payment_slip_no}</p>
              <p><span className="font-semibold">Mobile:</span> {selectedApp.mobile}</p>
              <p><span className="font-semibold">Email:</span> {selectedApp.email}</p>
              <p><span className="font-semibold">Address:</span> {selectedApp.address}</p>
              <p><span className="font-semibold">Status:</span> {selectedApp.status}</p>
            </div>

            {/* Action buttons inside modal */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                onClick={() => updateStatus(selectedApp.id, "Approved")}
                disabled={selectedApp.status === "Approved"}
              >
                Approve
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                onClick={() => updateStatus(selectedApp.id, "Rejected")}
                disabled={selectedApp.status === "Rejected"}
              >
                Reject
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
