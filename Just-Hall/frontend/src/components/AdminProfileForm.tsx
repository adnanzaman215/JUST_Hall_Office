"use client";
import React, { useState, useEffect } from "react";

interface AdminProfileFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  loading?: boolean;
  error?: string | null;
  successMessage?: string | null;
}

export default function AdminProfileForm({
  onSubmit,
  initialData = {},
  loading = false,
  error = null,
  successMessage = null,
}: AdminProfileFormProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(initialData.photoUrl || null);
  const [fullName, setFullName] = useState(initialData.fullName || "");
  const [adminId, setAdminId] = useState(initialData.adminId || "");
  const [designation, setDesignation] = useState(initialData.designation || "");
  const [department, setDepartment] = useState(initialData.department || "");
  const [dob, setDob] = useState(initialData.dob || "");
  const [gender, setGender] = useState(initialData.gender || "");
  const [mobile, setMobile] = useState(initialData.mobileNumber || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [address, setAddress] = useState(initialData.address || "");

  // Update existingPhotoUrl when initialData changes
  useEffect(() => {
    console.log('AdminProfileForm - initialData.photoUrl:', initialData.photoUrl);
    if (initialData.photoUrl) {
      setExistingPhotoUrl(initialData.photoUrl);
      console.log('AdminProfileForm - Updated existingPhotoUrl to:', initialData.photoUrl);
    }
  }, [initialData.photoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    // Backend expects these exact field names from CompleteProfileRequest
    formData.append('studentId', adminId); // Backend uses studentId field for adminId
    formData.append('session', designation); // Backend uses session field for designation
    formData.append('department', department);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('mobileNumber', mobile);
    formData.append('address', address);
    
    if (photo) {
      formData.append('photo', photo);
    }

    console.log('Admin form submitting with data:', {
      adminId,
      designation,
      department,
      dob,
      gender,
      mobile,
      address,
      hasPhoto: !!photo
    });

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
          src={(() => {
            const photoSrc = photo ? URL.createObjectURL(photo) : 
                 existingPhotoUrl ? `http://localhost:8000/media/${existingPhotoUrl.startsWith('/') ? existingPhotoUrl.slice(1) : existingPhotoUrl}` : 
                 "/default-profile.jpg";
            console.log('AdminProfileForm - Image src:', photoSrc);
            console.log('AdminProfileForm - existingPhotoUrl:', existingPhotoUrl);
            console.log('AdminProfileForm - photo file:', photo);
            return photoSrc;
          })()}
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
              placeholder="e.g., Dr. Rahim Uddin"
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Admin ID *</label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., ADMIN-001"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Designation *</label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., Hall Provost"
              required
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Department *</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., Hall Administration"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:gap-4">
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
        </div>

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
          <label className="block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black bg-gray-100 cursor-not-allowed"
            placeholder="something@teacher.just.edu.bd"
            required
            disabled
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="block text-sm font-medium text-slate-700">Address *</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
            placeholder="Permanent Address"
            rows={3}
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
