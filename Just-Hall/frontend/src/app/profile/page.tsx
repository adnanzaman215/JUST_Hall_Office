"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { getStoredToken, getStoredUser, storeUser } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";
import ClearCacheButton from "@/components/ClearCacheButton";

export default function ProfilePage() {
  const router = useRouter();
  const { updateUser } = useAuth();

  // State variables for form fields
  const [photo, setPhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [session, setSession] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMatherName] = useState("");
  const [mobile, setMobile] = useState("");
  const [emergencyMobile, setEmergencyMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check authentication and pre-fill user data
  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();
    
    console.log('Profile page loaded. Token:', token);
    console.log('User object:', user);
    console.log('User.student:', user?.student);
    console.log('User keys:', user ? Object.keys(user) : 'No user');
    
    if (!token || !user) {
      console.log('No token or user found, redirecting to login');
      router.push('/');
      return;
    }

    // Pre-fill basic user information from login data
    setFullName(user.full_name || "");
    setEmail(user.email || "");
    
    // Pre-fill student information if available from login response
    if (user.student) {
      setStudentId(user.student.student_id || "");
      setDepartment(user.student.department || "");
      setSession(user.student.session || "");
      setRoomNo(user.student.room_no?.toString() || "");
      setDob(user.student.dob || "");
      setGender(user.student.gender || "");
      setBloodGroup(user.student.blood_group || "");
      setFatherName(user.student.father_name || "");
      setMatherName(user.student.mother_name || "");
      setMobile(user.student.mobile_number || "");
      setEmergencyMobile(user.student.emergency_number || "");
      setAddress(user.student.address || "");
      setExistingPhotoUrl(user.student.photo_url || null);
      console.log('Student data loaded from login response');
    } else {
      console.log('No student data in login response, will fetch from API if needed');
    }

    // Function to fetch additional profile data from API if needed
    async function fetchUserProfile() {
      try {
        console.log('Fetching profile data from API...');
        if (token) {
          const profileData = await authAPI.getProfile(token);
          console.log('Profile data received:', profileData);
          if (profileData.student) {
            const student = profileData.student;
            // Only update fields that weren't already set from login response
            if (!user?.student) {
              setStudentId(student.student_id || "");
              setDepartment(student.department || "");
              setSession(student.session || "");
              setRoomNo(student.room_no?.toString() || "");
              setDob(student.dob || "");
              setGender(student.gender || "");
              setBloodGroup(student.blood_group || "");
              setFatherName(student.father_name || "");
              setMatherName(student.mother_name || "");
              setMobile(student.mobile_number || "");
              setEmergencyMobile(student.emergency_number || "");
              setAddress(student.address || "");
              setExistingPhotoUrl(student.photo_url || null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        console.log("Profile fetch failed, but user can still complete profile manually");
        // Don't block the user - they can complete profile manually
      }
    }

    // Only fetch from API if we don't have complete student data from login
    if (!user.student || !user.student.student_id) {
      console.log('Student data incomplete, fetching from API...');
      fetchUserProfile();
    }
  }, [router]);

  // Handle form submission
  async function handleSave() {
    // Check all required fields based on form labels with asterisks (*)
    if (!fullName || !studentId || !department || !session || !roomNo || !dob || !gender || !mobile || !emergencyMobile || !email || !address) {
      console.log('Validation failed. Missing fields:');
      console.log('fullName:', fullName);
      console.log('studentId:', studentId);
      console.log('department:', department);
      console.log('session:', session);
      console.log('roomNo:', roomNo);
      console.log('dob:', dob);
      console.log('gender:', gender);
      console.log('mobile:', mobile);
      console.log('emergencyMobile:', emergencyMobile);
      console.log('email:', email);
      console.log('address:', address);
      
      setError("Please fill in all the required fields marked with asterisk (*).");
      return;
    }

    // Validate room number is positive
    const roomNumber = parseInt(roomNo);
    if (isNaN(roomNumber) || roomNumber <= 0) {
      setError("Room number must be a positive number greater than 0.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const token = getStoredToken();
    if (!token) {
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    // Prepare profile data for submission
    const formData = new FormData();
    
    // Add text fields
    formData.append('email', email);
    formData.append('student_id', studentId);
    formData.append('department', department);
    formData.append('session', session);
    formData.append('room_no', roomNo);
    formData.append('dob', dob);
    formData.append('gender', gender);
    formData.append('blood_group', bloodGroup || '');
    formData.append('father_name', fatherName || '');
    formData.append('mother_name', motherName || '');
    formData.append('mobile_number', mobile);
    formData.append('emergency_number', emergencyMobile);
    formData.append('address', address);
    
    // Add photo if selected
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      console.log('Submitting profile data with photo...');
      const response = await authAPI.completeProfileWithPhoto(formData, token);
      console.log('Profile completion response:', response);
      
      if (response.success) {
        // Show success message from backend
        setSuccessMessage(response.message || "Profile completed successfully! Registration is now complete.");
        
        // Update stored user data to mark as verified and include student profile
        const currentUser = getStoredUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            full_name: fullName,
            student_id: studentId,
            department: department,
            is_verified: true,
            student_profile: {
              student_id: studentId,
              department: department,
              session: session,
              room_no: parseInt(roomNo),
              photo_url: response.photo_url || null
            }
          };
          storeUser(updatedUser);
          updateUser(updatedUser);
        }
        
        // Clear authentication data after successful profile completion
        setTimeout(() => {
          // Clear stored token and user data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          
          // Redirect to home page with success message
          router.push('/?registration=complete');
        }, 2000);
      } else {
        setError(response.message || "Failed to save the profile.");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to save the profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-10">
      {/* Header */}
      <section className="bg-gradient-to-r from-sky-700 via-cyan-700 to-teal-700 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold">Profile Setup</h1>
            <p className="mt-2 text-sky-100">Please complete your profile by filling in the details below.</p>
          </div>
          <div className="text-right">
            <ClearCacheButton />
            <p className="text-xs text-sky-200 mt-1">Clear cache if data not loading</p>
          </div>
        </div>
      </section>

      {/* Profile form */}
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
                 existingPhotoUrl ? `http://localhost:8000${existingPhotoUrl}` : 
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
        <form className="space-y-6 col-span-2">
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
                  // Only allow positive numbers or empty string
                  if (value === '' || parseInt(value) > 0) {
                    setRoomNo(value);
                  }
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
                placeholder="e.g., 305"
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
                <option value="" className="text-black">Select Gender</option>
                <option value="Male" className="text-black">Male</option>
                <option value="Female" className="text-black">Female</option>
                <option value="Other" className="text-black">Other</option>
              </select>
            </div>
            <div className="flex flex-col w-full">
              <label className="block text-sm font-medium text-slate-700">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              >
                <option value="" className="text-black">Select Blood Group</option>
                <option value="A+" className="text-black">A+</option>
                <option value="A-" className="text-black">A-</option>
                <option value="B+" className="text-black">B+</option>
                <option value="B-" className="text-black">B-</option>
                <option value="AB+" className="text-black">AB+</option>
                <option value="AB-" className="text-black">AB-</option>
                <option value="O+" className="text-black">O+</option>
                <option value="O-" className="text-black">O-</option>
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
                onChange={(e) => setMatherName(e.target.value)}
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
                placeholder="e.g., +880123456789"
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
                placeholder="e.g., +880987654321"
                required
              />
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-slate-700">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
              placeholder="e.g., name@university.edu"
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

          {/* Save Button */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-black bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {loading ? 'Saving...' : 'Save Information'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
