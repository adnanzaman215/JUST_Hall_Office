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
        setApprovedApplicants(data);
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
    if (room.availableSeats > 0) {
      setSelectedRoom(room.roomNumber);
      setShowAssignModal(true);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.isAllocated) {
      setSelectedSeatInfo(seat);
      setShowStudentModal(true);
    }
  };

  const handleStudentSelect = (student: Application) => {
    setSelectedStudent(student);
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
        setSelectedStudent(null);
        setSelectedRoom(null);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="relative bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <button
            onClick={() => router.push("/hall-portal")}
            className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-bold group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black mb-2">Seat Management</h1>
              <p className="text-xl text-cyan-100 font-medium">
                Assign and manage student accommodations - {floorMap ? `Floor ${floorMap.floor}` : ''}
              </p>
            </div>
          </div>

          {floorMap && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-100">Total Rooms</div>
                    <div className="text-2xl font-black">{floorMap.totalRooms}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.374.927L10 15.246l-4.626 1.68A1 1 0 014 16V4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-100">Total Seats</div>
                    <div className="text-2xl font-black">{floorMap.totalSeats}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-100">Allocated</div>
                    <div className="text-2xl font-black">{floorMap.allocatedSeats}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-100">Available</div>
                    <div className="text-2xl font-black">{floorMap.availableSeats}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Floor</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded"></span>
                <span>Available</span>
              </span>
              <span className="flex items-center gap-2 ml-4">
                <span className="w-4 h-4 bg-red-500 rounded"></span>
                <span>Allocated</span>
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  selectedFloor === floor
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading floor map...</p>
          </div>
        ) : floorMap ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Floor {floorMap.floor} - Room Layout
            </h2>
            
            <div className="grid grid-cols-5 gap-4">
              {floorMap.rooms.map((room) => (
                <div
                  key={room.roomNumber}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleRoomClick(room)}
                >
                  <div className="text-center mb-3">
                    <div className="text-lg font-bold text-gray-800">Room {room.roomNumber}</div>
                    <div className="text-xs text-gray-500">{room.allocatedSeats}/{room.totalSeats} occupied</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {room.seats.map((seat) => (
                      <div
                        key={seat.seatId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeatClick(seat);
                        }}
                        className={`p-2 rounded-lg text-center text-xs font-bold text-white transition-all cursor-pointer ${
                          seat.isAllocated
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        title={seat.isAllocated ? `${seat.studentName}` : `Available seat`}
                      >
                        <div>{seat.seatNumber}</div>
                        <div className="text-[10px] opacity-75">
                          {seat.seatType === "Balcony" ? "(B)" : "(C)"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <p className="text-gray-600">No data available for this floor</p>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Assign Student to Room {selectedRoom}
                </h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudent(null);
                    setSelectedRoom(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Select a student from the approved applicants list below:
                </p>
                <p className="text-sm text-gray-500">
                  {approvedApplicants.length} approved applicant(s) waiting for seat assignment
                </p>
              </div>

              {approvedApplicants.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 font-medium">No approved applicants available</p>
                  <p className="text-sm text-gray-400">All approved students have been assigned seats</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {approvedApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      onClick={() => handleStudentSelect(applicant)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedStudent?.id === applicant.id
                          ? "border-blue-600 bg-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {applicant.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">{applicant.fullName}</div>
                          <div className="text-sm text-gray-600">
                            {applicant.studentId} | {applicant.department}
                          </div>
                        </div>
                        {selectedStudent?.id === applicant.id && (
                          <div className="text-blue-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudent(null);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSeat}
                  disabled={!selectedStudent}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Assign Seat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && selectedSeatInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Seat Information</h2>
                <button
                  onClick={() => {
                    setShowStudentModal(false);
                    setSelectedSeatInfo(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3">
                    {selectedSeatInfo.studentName?.charAt(0) || 'N'}
                  </div>
                  <div className="bg-red-100 text-red-800 inline-block px-4 py-2 rounded-lg font-bold">
                    {selectedSeatInfo.seatId}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Student Name</div>
                    <div className="font-bold text-gray-800">{selectedSeatInfo.studentName}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Student ID</div>
                    <div className="font-bold text-gray-800">{selectedSeatInfo.studentId}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Department</div>
                    <div className="font-bold text-gray-800">{selectedSeatInfo.department}</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-600 mb-1">Seat Type</div>
                    <div className="font-bold text-gray-800">
                      {selectedSeatInfo.seatType === "Balcony" ? "Balcony (B)" : "Corridor (C)"}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setSelectedSeatInfo(null);
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
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
