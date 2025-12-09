"use client";
import React, { useState, useEffect } from "react";

interface StudentProfileFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

export default function StudentProfileForm({
  onSubmit,
  initialData = {},
  loading = false,
  error = null,
  successMessage = null,
}: StudentProfileFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(initialData.photoUrl || null);
  const [fullName, setFullName] = useState(initialData.fullName || "");
  const [studentId, setStudentId] = useState(initialData.studentId || "");
  const [department, setDepartment] = useState(initialData.department || "");
  const [session, setSession] = useState(initialData.session || "");
  const [roomNo, setRoomNo] = useState(initialData.roomNo?.toString() || "");
  const [dob, setDob] = useState(initialData.dob || "");
  const [gender, setGender] = useState(initialData.gender || "");
  const [bloodGroup, setBloodGroup] = useState(initialData.bloodGroup || "");
  const [fatherName, setFatherName] = useState(initialData.fatherName || "");
  const [motherName, setMotherName] = useState(initialData.motherName || "");
  const [mobile, setMobile] = useState(initialData.mobileNumber || "");
  const [emergencyMobile, setEmergencyMobile] = useState(initialData.emergencyNumber || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [address, setAddress] = useState(initialData.address || "");

  // Update existingPhotoUrl when initialData changes
  useEffect(() => {
    if (initialData.photoUrl) {
      setExistingPhotoUrl(initialData.photoUrl);
    }
  }, [initialData.photoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate room number
    const roomNumber = parseInt(roomNo);
    if (isNaN(roomNumber) || roomNumber <= 0) {
      return;
    }

    const formData = new FormData();
    // Backend expects these exact field names from CompleteProfileRequest
    formData.append('studentId', studentId);
    formData.append('department', department);
    formData.append('session', session);
    formData.append('roomNo', roomNo);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('bloodGroup', bloodGroup || '');
    formData.append('fatherName', fatherName || '');
    formData.append('motherName', motherName || '');
    formData.append('mobileNumber', mobile);
    formData.append('emergencyNumber', emergencyMobile);
    formData.append('address', address);
    
    if (photo) {
      formData.append('photo', photo);
    }

    await onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="col-span-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Left Pane - Profile Image */}
      <div className="flex flex-col items-center">
        <img
          src={photo ? URL.createObjectURL(photo) : 
               existingPhotoUrl ? `http://localhost:8000/media/${existingPhotoUrl.startsWith('/') ? existingPhotoUrl.slice(1) : existingPhotoUrl}` : 
               "/default-profile.jpg"}
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-cyan-600 mb-4"
        />
        <button
          type="button"
          className="bg-cyan-600 text-white px-4 py-2 rounded-full mt-2"
          onClick={() => document.getElementById("photoUpload")?.click()}
        >
          {photo ? "Change Photo" : existingPhotoUrl ? "Update Photo" : "Upload Photo"}
        </button>
        <input
          type="file"
          id="photoUpload"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
        />
      </div>

      {/* Right Pane - Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-6 col-span-2">
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., Md. Rahim Uddin"
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Student ID *</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., 2018-1-60-001"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Department *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., Computer Science"
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Session *</label>
            <input
              type="text"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., 2021-2025"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Room No *</label>
            <input
              type="number"
              min="1"
              value={roomNo}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseInt(value) > 0) {
                  setRoomNo(value);
                }
              }}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., 101"
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Date of Birth *</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Father&apos;s Name</label>
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="Father's full name"
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Mother&apos;s Name</label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="Mother's full name"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Mobile Number *</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., 01712345678"
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Emergency Mobile Number *</label>
            <input
              type="tel"
              value={emergencyMobile}
              onChange={(e) => setEmergencyMobile(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., 01812345678"
              required
            />
          </div>
        </div>

        <div className="flex flex-col w-full">
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black bg-gray-100 cursor-not-allowed"
            placeholder="something@student.just.edu.bd"
            required
            disabled
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="block text-sm font-medium text-slate-700">Permanent Address *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
            placeholder="Enter your permanent address"
            required
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Saving..." : "Save Information"}
          </button>
        </div>
      </form>
    </div>
  );
}
