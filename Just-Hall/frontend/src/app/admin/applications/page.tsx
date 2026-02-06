"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken, getStoredUser } from "@/lib/auth";

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
  fatherOccupation?: string;
  motherOccupation?: string;
  householdIncome?: number;
  paymentSlipNo: string;
  paymentSlipUrl?: string;
  profilePhotoUrl?: string;
  status: string;
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("Pending");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [floorMap, setFloorMap] = useState<any>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const user = getStoredUser();
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchApplications();
  }, [router]);

  const fetchApplications = async () => {
    try {
      console.log('🔍 Fetching applications from backend...');
      const response = await fetch('http://localhost:8000/api/applications');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to fetch applications: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      console.log('✅ Applications fetched:', data.length, 'applications');
      console.log('📊 Applications data:', data);
      setApplications(data);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloorMap = async (floor: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/seats/floor/${floor}`);
      if (response.ok) {
        const data = await response.json();
        setFloorMap(data);
      }
    } catch (error) {
      console.error("Error fetching floor map:", error);
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === "All" ? true : app.status === filter
  );

  const handleApprove = async (app: Application) => {
    setSelectedApp(app);
    setActionLoading(true);
    
    try {
      console.log('Approving application ID:', app.id);
      // First approve the application
      const response = await fetch(`http://localhost:8000/api/applications/${app.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Approval response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to approve application';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
          const textError = await response.text();
          errorMessage = textError || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Approval successful:', result);

      // After approval, show seat map for assignment
      await fetchFloorMap(selectedFloor);
      setShowSeatMap(true);
      fetchApplications(); // Refresh to show updated status
    } catch (err: any) {
      console.error('Approval error:', err);
      alert("Failed to approve application: " + (err.message || err.toString()));
      setSelectedApp(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeatAssignment = async (roomNumber: number) => {
    if (!selectedApp) {
      alert("No application selected");
      return;
    }

    if (!confirm(`Assign Room ${roomNumber} to ${selectedApp.fullName}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/seats/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomNumber: roomNumber,
          applicationId: selectedApp.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign seat');
      }

      const result = await response.json();
      const seatInfo = result.seatDesignation || `Room ${roomNumber}`;
      alert(`Seat ${seatInfo} assigned to ${selectedApp.fullName} successfully!`);
      setShowSeatMap(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      alert("Failed to assign seat: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (app: Application) => {
    if (!confirm(`Are you sure you want to reject ${app.fullName}'s application?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/applications/${app.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject application');
      }

      const result = await response.json();
      alert("Application rejected");
      fetchApplications();
    } catch (err: any) {
      alert("Failed to reject application: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Hall Seat Applications</h1>
          <p className="text-lg text-slate-600">Review and manage student applications</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === status
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {status} {status === filter && `(${filteredApplications.length})`}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-600 text-lg">No {filter.toLowerCase()} applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Profile Photo */}
                    {app.profilePhotoUrl && (
                      <img
                        src={`http://localhost:8000/media/${app.profilePhotoUrl}`}
                        alt={app.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                      />
                    )}

                    {/* Application Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{app.fullName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Student ID:</span>
                          <p className="font-semibold">{app.studentId}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Department:</span>
                          <p className="font-semibold">{app.department}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Session:</span>
                          <p className="font-semibold">{app.session}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Mobile:</span>
                          <p className="font-semibold">{app.mobile}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Email:</span>
                          <p className="font-semibold text-xs">{app.email}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Applied:</span>
                          <p className="font-semibold text-xs">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {app.status === "Pending" && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(app)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(app)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seat Map Modal */}
      {showSeatMap && selectedApp && floorMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Assign Seat</h2>
                  <p className="text-cyan-100">
                    Select a room for <strong>{selectedApp.fullName}</strong> ({selectedApp.studentId})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSeatMap(false);
                    setSelectedApp(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Floor Selector */}
              <div className="flex gap-2 overflow-x-auto">
                {[1, 2, 3, 4, 5, 6].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => {
                      setSelectedFloor(floor);
                      fetchFloorMap(floor);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      selectedFloor === floor
                        ? "bg-white text-blue-600"
                        : "bg-white/20 hover:bg-white/30"
                    }`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Statistics */}
            <div className="p-6 bg-slate-50 grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-slate-600">Total Rooms</div>
                <div className="text-2xl font-bold text-slate-900">{floorMap.totalRooms}</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-slate-600">Total Seats</div>
                <div className="text-2xl font-bold text-slate-900">{floorMap.totalSeats}</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-green-600">Available</div>
                <div className="text-2xl font-bold text-green-600">{floorMap.availableSeats}</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-red-600">Occupied</div>
                <div className="text-2xl font-bold text-red-600">{floorMap.allocatedSeats}</div>
              </div>
            </div>

            {/* Room Grid */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Legend:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-slate-600">Available Seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-slate-600">Occupied Seat</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {floorMap.rooms.map((room: any) => (
                  <div
                    key={room.roomNumber}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      room.availableSeats > 0
                        ? "border-green-400 bg-green-50 hover:border-green-600 hover:shadow-lg cursor-pointer"
                        : "border-slate-300 bg-slate-100 opacity-60"
                    }`}
                    onClick={() => {
                      if (room.availableSeats > 0) {
                        handleSeatAssignment(room.roomNumber);
                      }
                    }}
                  >
                    {/* Room Number */}
                    <div className="text-center mb-3">
                      <div className="text-xl font-bold text-slate-900">{room.roomNumber}</div>
                      <div className="text-xs text-slate-600">
                        {room.allocatedSeats}/{room.totalSeats} occupied
                      </div>
                    </div>

                    {/* Seats Grid (2x2) */}
                    <div className="grid grid-cols-2 gap-1">
                      {room.seats.map((seat: any) => (
                        <div
                          key={seat.seatId}
                          className={`aspect-square rounded flex flex-col items-center justify-center text-xs ${
                            seat.isAllocated
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                          title={seat.isAllocated ? `Occupied by ${seat.studentName}` : "Available"}
                        >
                          <div className="font-bold">{seat.seatNumber}</div>
                          <div className="text-[10px]">({seat.seatType})</div>
                        </div>
                      ))}
                    </div>

                    {/* Click instruction */}
                    {room.availableSeats > 0 && (
                      <div className="mt-2 text-center">
                        <div className="text-xs text-green-700 font-semibold">Click to assign</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-2xl border-t">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Click on any room with available seats to assign it to the student
                </p>
                <button
                  onClick={() => {
                    setShowSeatMap(false);
                    setSelectedApp(null);
                  }}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
