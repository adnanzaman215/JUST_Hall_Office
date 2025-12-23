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

interface SeatAllocation {
  id: number;
  floorNumber: number;
  roomNumber: number;
  seatNumber: number;
  applicationId: number;
  studentName: string;
  studentId: string;
  department: string;
  profilePhotoUrl: string;
  assignedAt: string;
}

interface RoomInfo {
  floorNumber: number;
  roomNumber: number;
  occupiedSeats: number;
  availableSeats: number;
  allocations: SeatAllocation[];
}

interface FloorMap {
  floorNumber: number;
  totalRooms: number;
  occupiedRooms: number;
  totalSeats: number;
  occupiedSeats: number;
  rooms: RoomInfo[];
}

export default function ManageSeatsPage() {
  const router = useRouter();
  const [approvedApplicants, setApprovedApplicants] = useState<Application[]>([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [floorMap, setFloorMap] = useState<FloorMap | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Application | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
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

  const handleSeatClick = (roomNumber: number, seatNumber: number, room: RoomInfo) => {
    // Check if seat is occupied
    const seatOccupied = room.allocations.some((a) => a.seatNumber === seatNumber);
    
    if (seatOccupied) {
      // Show student info
      const allocation = room.allocations.find((a) => a.seatNumber === seatNumber);
      if (allocation) {
        alert(`Seat occupied by:\n${allocation.studentName}\n${allocation.studentId}\n${allocation.department}`);
      }
    } else {
      // Allow assignment
      setSelectedRoom(roomNumber);
      setSelectedSeat(seatNumber);
      setShowAssignModal(true);
    }
  };

  const handleStudentSelect = (student: Application) => {
    setSelectedStudent(student);
  };

  const handleAssignSeat = async () => {
    if (!selectedStudent || selectedRoom === null || selectedSeat === null) {
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
          floorNumber: selectedFloor,
          roomNumber: selectedRoom,
          seatNumber: selectedSeat,
          applicationId: selectedStudent.id,
        }),
      });

      if (response.ok) {
        alert("Seat assigned successfully!");
        setShowAssignModal(false);
        setSelectedStudent(null);
        setSelectedRoom(null);
        setSelectedSeat(null);
        fetchApprovedApplicants();
        fetchFloorMap(selectedFloor);
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error assigning seat:", error);
      alert("Failed to assign seat");
    }
  };

  const getSeatColor = (room: RoomInfo, seatNumber: number) => {
    const isOccupied = room.allocations.some((a) => a.seatNumber === seatNumber);
    return isOccupied ? "bg-red-500" : "bg-green-500 hover:bg-green-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <button
            onClick={() => router.push("/hall-portal")}
            className="mb-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Manage Student Seats</h1>
          <p className="text-white/90 mt-2">Assign seats to approved students</p>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Approved Applicants */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Approved Students ({approvedApplicants.length})
              </h2>
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {approvedApplicants.map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.profilePhotoUrl?.startsWith('/media/') 
                          ? `http://localhost:8000${student.profilePhotoUrl}` 
                          : `http://localhost:8000/media/${student.profilePhotoUrl}`}
                        alt={student.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-gray-600">{student.studentId}</p>
                        <p className="text-xs text-gray-500 truncate">{student.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Floor Map */}
          <div className="lg:col-span-3">
            {/* Floor Selector */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Select Floor</h2>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      selectedFloor === floor
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Floor {floor}
                  </button>
                ))}
              </div>

              {floorMap && (
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Occupied</span>
                  </div>
                  <div className="ml-auto">
                    <span className="font-semibold">
                      {floorMap.occupiedSeats}/{floorMap.totalSeats} seats occupied
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Room Grid */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Floor {selectedFloor} - Room Layout
              </h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading rooms...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                  {floorMap?.rooms.map((room) => (
                    <div
                      key={room.roomNumber}
                      className="bg-gray-50 rounded-lg p-3 border-2 border-gray-200"
                    >
                      <div className="text-center mb-2">
                        <p className="font-bold text-sm text-gray-700">
                          Room {room.roomNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {room.occupiedSeats}/4
                        </p>
                      </div>
                      
                      {/* 2x2 Seat Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((seatNumber) => (
                          <button
                            key={seatNumber}
                            onClick={() => handleSeatClick(room.roomNumber, seatNumber, room)}
                            className={`w-full h-10 rounded ${getSeatColor(
                              room,
                              seatNumber
                            )} text-white text-xs font-semibold transition-all`}
                          >
                            {seatNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Assign Seat
            </h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Floor:</strong> {selectedFloor}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Room:</strong> {selectedRoom}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Seat:</strong> {selectedSeat}
              </p>
            </div>

            {selectedStudent ? (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedStudent.profilePhotoUrl?.startsWith('/media/') 
                      ? `http://localhost:8000${selectedStudent.profilePhotoUrl}` 
                      : `http://localhost:8000/media/${selectedStudent.profilePhotoUrl}`}
                    alt={selectedStudent.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <div>
                    <p className="font-bold text-gray-900">{selectedStudent.fullName}</p>
                    <p className="text-sm text-gray-600">{selectedStudent.studentId}</p>
                    <p className="text-sm text-gray-600">{selectedStudent.department}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600">
                  Please select a student from the left sidebar
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAssignSeat}
                disabled={!selectedStudent}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Assignment
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRoom(null);
                  setSelectedSeat(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
