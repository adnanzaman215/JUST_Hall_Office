"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: number;
  fullName: string;
  studentId: string;
  department: string;
  session: string;
  profilePhotoUrl: string;
  email: string;
  mobile: string;
}

interface Seat {
  seatId: string;
  roomNumber: number;
  seatType: string;
  seatNumber: number;
  isAllocated: boolean;
  studentName: string | null;
  studentId: string | null;
  department: string | null;
  session: string | null;
  profilePhotoUrl: string | null;
}

interface Room {
  roomNumber: number;
  floor: number;
  totalSeats: number;
  allocatedSeats: number;
  availableSeats: number;
  seats: Seat[];
}

interface FloorMap {
  floor: number;
  totalRooms: number;
  totalSeats: number;
  allocatedSeats: number;
  availableSeats: number;
  rooms: Room[];
}

export default function ManageSeatsPage() {
  const router = useRouter();
  const [approvedApplicants, setApprovedApplicants] = useState<Application[]>([]);
  const [selectedFloor, setSelectedFloor] = useState(2);
  const [floorMap, setFloorMap] = useState<FloorMap | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Application | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedSeatInfo, setSelectedSeatInfo] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedApplicants();
    fetchFloorMap(selectedFloor);
  }, [selectedFloor]);

  const fetchApprovedApplicants = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/seats/approved-applicants");
      if (response.ok) {
        const data = await response.json();
        console.log("Approved applicants data:", data);
        setApprovedApplicants(data);
      } else {
        console.error("Failed to fetch approved applicants:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching approved applicants:", error);
    }
  };

  const fetchFloorMap = async (floor: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/seats/floor/${floor}`);
      if (response.ok) {
        const data = await response.json();
        setFloorMap(data);
      }
    } catch (error) {
      console.error("Error fetching floor map:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room: Room) => {
    if (room.availableSeats > 0 && selectedStudent) {
      setSelectedRoom(room.roomNumber);
      setShowAssignModal(true);
    } else if (!selectedStudent) {
      alert("Please select a student from the left panel first");
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.isAllocated) {
      // Show info for allocated seats
      setSelectedSeatInfo(seat);
      setShowStudentModal(true);
    } else {
      // Allow direct assignment to available seats
      if (!selectedStudent) {
        alert("Please select a student from the left panel first");
        return;
      }
      setSelectedRoom(seat.roomNumber);
      setShowAssignModal(true);
    }
  };

  const handleAssignSeat = async () => {
    if (!selectedStudent || selectedRoom === null) {
      alert("Please select a student");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/seats/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: selectedRoom,
          applicationId: selectedStudent.id,
        }),
      });

      if (response.ok) {
        alert("Seat assigned successfully!");
        setShowAssignModal(false);
        setSelectedRoom(null);
        
        // Remove assigned student from the list immediately
        setApprovedApplicants(approvedApplicants.filter(app => app.id !== selectedStudent.id));
        setSelectedStudent(null);
        
        // Refresh data from backend
        fetchApprovedApplicants();
        fetchFloorMap(selectedFloor);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to assign seat"}`);
      }
    } catch (error) {
      console.error("Error assigning seat:", error);
      alert("Failed to assign seat");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#0f2027] via-[#0f5e73] to-[#0b7872] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 py-6">
          <div className="flex items-start gap-4 mb-4">
            <button
              onClick={() => router.push("/hall-portal")}
              className="mt-1 p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">Seat Management</h1>
                <p className="text-white/90 text-sm md:text-base">
                  Assign and manage student accommodations - {floorMap ? `Floor ${floorMap.floor}` : ''}
                </p>
              </div>
            </div>
          </div>

          {floorMap && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70">Total Rooms</div>
                    <div className="text-xl font-black">{floorMap.totalRooms}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="bg-purple-500 rounded-lg p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.374.927L10 15.246l-4.626 1.68A1 1 0 014 16V4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70">Total Seats</div>
                    <div className="text-xl font-black">{floorMap.totalSeats}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="bg-red-500 rounded-lg p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70">Allocated</div>
                    <div className="text-xl font-black">{floorMap.allocatedSeats}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2.5">
                  <div className="bg-green-500 rounded-lg p-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/70">Available</div>
                    <div className="text-xl font-black">{floorMap.availableSeats}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Left Sidebar - Student List */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden sticky top-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Approved Applicants</h2>
                    <p className="text-blue-100 text-xs mt-1">{approvedApplicants.length} waiting</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {approvedApplicants.length === 0 ? (
                  <div className="py-4 px-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ No approved applicants found. Make sure applications are approved in the system.
                    </p>
                  </div>
                ) : (
                  <div className="mb-3 py-2 px-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                    <p className="text-xs text-blue-800 font-medium">
                      💡 Select a student, then click any green seat to assign
                    </p>
                  </div>
                )}

                {/* Student List */}
                <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto pr-2">
                  {approvedApplicants.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 font-medium">No applicants found</p>
                      <p className="text-sm text-gray-400 mt-1">Check the applications page</p>
                    </div>
                  ) : (
                    approvedApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        onClick={() => setSelectedStudent(applicant)}
                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedStudent?.id === applicant.id
                            ? "border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md">
                            {applicant.fullName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-800 truncate">{applicant.fullName}</div>
                            <div className="text-xs text-gray-600 truncate">{applicant.studentId}</div>
                            <div className="text-[10px] text-gray-500 truncate">{applicant.department}</div>
                            <div className="text-[10px] text-gray-500">Session: {applicant.session}</div>
                          </div>
                          {selectedStudent?.id === applicant.id && (
                            <div className="text-blue-600 flex-shrink-0">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Floor Map */}
          <div className="xl:col-span-3">
            {/* Floor Selection Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 mb-4 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Select Floor</h2>
                      <p className="text-purple-100 text-sm mt-1">Choose a floor to view rooms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <span className="w-3 h-3 bg-green-400 rounded"></span>
                      <span className="text-white font-medium">Available</span>
                    </span>
                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <span className="w-3 h-3 bg-red-400 rounded"></span>
                      <span className="text-white font-medium">Occupied</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {selectedStudent && (
                  <div className="mb-3 py-2 px-3 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl">
                    <p className="text-xs text-purple-800 font-medium">
                      💡 Click on any <span className="font-bold text-green-600">green seat</span> to assign {selectedStudent.fullName}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((floor) => (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                        selectedFloor === floor
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105"
                          : "bg-slate-100 text-gray-700 hover:bg-slate-200 hover:scale-105"
                      }`}
                    >
                      Floor {floor}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Layout Card */}
            {loading ? (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading floor map...</p>
              </div>
            ) : floorMap ? (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-4">
                  <h2 className="text-xl font-bold text-white">
                    Floor {floorMap.floor} - Room Layout
                  </h2>
                  <p className="text-slate-300 text-xs mt-0.5">
                    {floorMap.availableSeats} seats available out of {floorMap.totalSeats}
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
                  {floorMap.rooms.map((room) => (
                    <div
                      key={room.roomNumber}
                      className={`border-2 rounded-xl p-2 transition-all duration-200 ${
                        room.availableSeats > 0 && selectedStudent
                          ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-500 hover:shadow-xl cursor-pointer transform hover:scale-105"
                          : room.availableSeats > 0
                          ? "border-slate-200 bg-white cursor-not-allowed opacity-60"
                          : "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                      }`}
                      onClick={() => handleRoomClick(room)}
                    >
                      <div className="text-center mb-1.5">
                        <div className="text-xs font-bold text-gray-800">Room {room.roomNumber}</div>
                        <div className="text-[10px] text-gray-500">{room.allocatedSeats}/{room.totalSeats}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        {room.seats.map((seat) => (
                          <div
                            key={seat.seatId}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeatClick(seat);
                            }}
                            className={`p-1 rounded-lg text-center text-[10px] font-bold text-white transition-all cursor-pointer ${
                              seat.isAllocated
                                ? "bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:scale-110 shadow-md"
                                : selectedStudent
                                ? "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-110 hover:shadow-lg ring-2 ring-green-300"
                                : "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 opacity-60"
                            }`}
                            title={
                              seat.isAllocated 
                                ? `Occupied: ${seat.studentName}` 
                                : selectedStudent
                                ? `Click to assign ${selectedStudent.fullName} to this seat`
                                : `Available - Select a student first`
                            }
                          >
                            <div className="text-xs">{seat.seatNumber}</div>
                            <div className="text-[8px] opacity-90">
                              {seat.seatType === "Balcony" ? "(B)" : "(C)"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">No data available for this floor</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">
                    Confirm Assignment
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRoom(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  You are about to assign the following student to Room {selectedRoom}:
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {selectedStudent.fullName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-lg">{selectedStudent.fullName}</div>
                      <div className="text-sm text-gray-600">{selectedStudent.studentId}</div>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Department:</span>
                      <span className="font-semibold text-gray-800">{selectedStudent.department}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-600 font-medium">Session:</span>
                      <span className="font-semibold text-gray-800">{selectedStudent.session}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="font-semibold text-gray-800 text-xs">{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-6 py-3.5 bg-slate-200 text-gray-700 rounded-xl font-bold hover:bg-slate-300 transition-all hover:scale-105 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSeat}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Info Modal */}
      {showStudentModal && selectedSeatInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight">Occupant Details</h2>
                    <p className="text-red-100 text-xs mt-0.5">Seat allocation information</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStudentModal(false);
                    setSelectedSeatInfo(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
              {/* Profile Section */}
              <div className="text-center mb-4 pb-4 border-b-2 border-gray-200">
                <div className="relative inline-block mb-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-red-100 mx-auto">
                    {selectedSeatInfo.studentName?.charAt(0) || 'N'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    Active
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedSeatInfo.studentName}</h3>
                <div className="inline-flex items-center gap-2 bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 px-4 py-1.5 rounded-full shadow-sm">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-extrabold text-red-700 tracking-wide">{selectedSeatInfo.seatId}</span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="space-y-2.5 mb-4">
                {/* Student ID */}
                <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Student ID</div>
                      <div className="font-bold text-gray-800 text-base">{selectedSeatInfo.studentId}</div>
                    </div>
                  </div>
                </div>

                {/* Department & Session Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Department</div>
                        <div className="font-bold text-gray-800 text-xs leading-tight">{selectedSeatInfo.department}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-2 mb-1.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Session</div>
                        <div className="font-bold text-gray-800 text-xs leading-tight">{selectedSeatInfo.session || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seat Type */}
                <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 hover:border-orange-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Seat Type</div>
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-800 text-base">
                          {selectedSeatInfo.seatType === "Balcony" ? "Balcony Side" : "Corridor Side"}
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedSeatInfo.seatType === "Balcony" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {selectedSeatInfo.seatType === "Balcony" ? "B" : "C"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setSelectedSeatInfo(null);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-2xl font-bold transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
