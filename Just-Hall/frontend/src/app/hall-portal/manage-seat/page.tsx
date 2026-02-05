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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-10">
          {/* Back Button */}
          <button
            onClick={() => router.push("/hall-portal")}
            className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-bold group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          {/* Title Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black mb-2">Seat Management</h1>
              <p className="text-xl text-cyan-100 font-medium">
                Assign and manage student accommodations
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {floorMap && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-sm font-bold">Available Seats</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {floorMap.totalSeats - floorMap.occupiedSeats}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-sm font-bold">Occupied Seats</span>
                </div>
                <div className="text-3xl font-black text-white">{floorMap.occupiedSeats}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-sm font-bold">Total Capacity</span>
                </div>
                <div className="text-3xl font-black text-white">{floorMap.totalSeats}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-500 rounded-lg p-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-cyan-100 text-sm font-bold">Occupancy Rate</span>
                </div>
                <div className="text-3xl font-black text-white">
                  {((floorMap.occupiedSeats / floorMap.totalSeats) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Approved Applicants */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl p-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Approved Students</h2>
                  <p className="text-sm text-gray-600 font-medium">{approvedApplicants.length} waiting</p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                {approvedApplicants.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedStudent?.id === student.id
                        ? "border-blue-600 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg"
                        : "border-gray-200 hover:border-blue-300 bg-white hover:shadow-md"
                    }`}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={student.profilePhotoUrl?.startsWith('/media/') 
                            ? `http://localhost:8000${student.profilePhotoUrl}` 
                            : `http://localhost:8000/media/${student.profilePhotoUrl}`}
                          alt={student.fullName}
                          className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/150";
                          }}
                        />
                        {selectedStudent?.id === student.id && (
                          <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-1">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-gray-900 truncate">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-blue-600 font-bold">{student.studentId}</p>
                        <p className="text-xs text-gray-600 font-medium truncate mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {student.department}
                        </p>
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
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl p-3">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Select Floor</h2>
                    <p className="text-sm text-gray-600 font-medium">Choose a floor to view room layout</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((floor) => (
                  <button
                    key={floor}
                    onClick={() => setSelectedFloor(floor)}
                    className={`group relative px-8 py-4 rounded-xl font-black transition-all duration-200 hover:scale-105 overflow-hidden ${
                      selectedFloor === floor
                        ? "bg-gradient-to-br from-blue-700 via-cyan-700 to-blue-800 text-white shadow-lg shadow-blue-500/50"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selectedFloor === floor && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    )}
                    <div className="relative flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Floor {floor}
                    </div>
                  </button>
                ))}
              </div>

              {floorMap && (
                <div className="mt-5 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-md"></div>
                      <span className="text-sm font-bold text-gray-700">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg shadow-md"></div>
                      <span className="text-sm font-bold text-gray-700">Occupied</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-indigo-200">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-black text-gray-900">
                        {floorMap.occupiedSeats}/{floorMap.totalSeats} Occupied
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Room Grid */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl p-3">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Floor {selectedFloor} Layout
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">Click on available seats to assign</p>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600 font-bold mt-4">Loading rooms...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {floorMap?.rooms.map((room) => (
                    <div
                      key={room.roomNumber}
                      className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="text-center mb-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                          <p className="font-black text-sm text-gray-900">
                            Room {room.roomNumber}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 rounded-full">
                          <span className="text-xs font-black text-blue-700">
                            {room.occupiedSeats}/4 Occupied
                          </span>
                        </div>
                      </div>
                      
                      {/* 2x2 Seat Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((seatNumber) => {
                          const isOccupied = room.allocations.some((a) => a.seatNumber === seatNumber);
                          return (
                            <button
                              key={seatNumber}
                              onClick={() => handleSeatClick(room.roomNumber, seatNumber, room)}
                              className={`relative w-full h-12 rounded-lg text-white text-xs font-black transition-all duration-200 flex items-center justify-center shadow-md hover:scale-105 ${
                                isOccupied
                                  ? "bg-gradient-to-br from-red-400 to-rose-500 cursor-not-allowed"
                                  : "bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 cursor-pointer"
                              }`}
                            >
                              <svg className="w-5 h-5 absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                              </svg>
                              <span>{seatNumber}</span>
                              {isOccupied && (
                                <svg className="w-4 h-4 absolute top-1 right-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-slate-800 via-blue-800 to-cyan-800 p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black">Assign Seat</h2>
                  <p className="text-cyan-100 text-sm font-medium">Allocate seat to student</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Seat Information */}
              <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2 shadow-sm">
                      <svg className="w-6 h-6 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Floor</p>
                    <p className="text-lg font-black text-gray-900">{selectedFloor}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2 shadow-sm">
                      <svg className="w-6 h-6 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Room</p>
                    <p className="text-lg font-black text-gray-900">{selectedRoom}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2 shadow-sm">
                      <svg className="w-6 h-6 text-blue-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">Seat</p>
                    <p className="text-lg font-black text-gray-900">{selectedSeat}</p>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              {selectedStudent ? (
                <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedStudent.profilePhotoUrl?.startsWith('/media/') 
                        ? `http://localhost:8000${selectedStudent.profilePhotoUrl}` 
                        : `http://localhost:8000/media/${selectedStudent.profilePhotoUrl}`}
                      alt={selectedStudent.fullName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-black text-lg text-gray-900 mb-1">{selectedStudent.fullName}</p>
                      <p className="text-sm text-green-700 font-bold">{selectedStudent.studentId}</p>
                      <p className="text-sm text-gray-600 font-medium mt-1 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        {selectedStudent.department}
                      </p>
                    </div>
                    <div className="bg-green-600 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-300 flex items-center gap-3">
                  <svg className="w-8 h-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-gray-700 font-bold">
                    Please select a student from the left sidebar
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAssignSeat}
                  disabled={!selectedStudent}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-700 to-cyan-700 text-white rounded-xl font-black hover:from-blue-800 hover:to-cyan-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Confirm Assignment
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRoom(null);
                    setSelectedSeat(null);
                  }}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-black hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #1e40af, #0e7490);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1e3a8a, #0c4a6e);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
