"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const userData = getStoredUser();
    
    if (!token || !userData) {
      router.push("/");
      return;
    }

    setUser(userData);
    setRole(userData.role?.toLowerCase() || "student");
    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authAPI.getProfile(token);
      setProfileData(data);
    } catch (e) {
      console.error("Failed to fetch profile:", e);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not provided";
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {role === "student" ? "Student Profile" : role === "staff" ? "Staff Profile" : "Admin Profile"}
              </h1>
              <p className="text-gray-600 mt-1">View your profile information</p>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              {(() => {
                const photoUrl = profileData?.student?.photoUrl ||
                                 profileData?.staff?.photoUrl ||
                                 profileData?.admin?.photoUrl;
                return (
                  <img
                    src={
                      photoUrl
                        ? `http://localhost:8000/media/${photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl}`
                        : "/default-profile.jpg"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-cyan-600 mb-4"
                  />
                );
              })()}
              <h2 className="text-xl font-semibold text-gray-900">{user?.fullName || user?.full_name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <span className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>

            {/* Profile Details - Student */}
            {role === "student" && profileData?.student && (
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-gray-900 font-medium">{profileData.student.studentId || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 font-medium">{profileData.student.department || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Session</label>
                  <p className="text-gray-900 font-medium">{profileData.student.session || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Room No</label>
                  <p className="text-gray-900 font-medium">{profileData.student.roomNo || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 font-medium">{formatDate(profileData.student.dob)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900 font-medium">{profileData.student.gender || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <p className="text-gray-900 font-medium">{profileData.student.bloodGroup || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-gray-900 font-medium">{profileData.student.mobileNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Number</label>
                  <p className="text-gray-900 font-medium">{profileData.student.emergencyNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Father's Name</label>
                  <p className="text-gray-900 font-medium">{profileData.student.fatherName || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mother's Name</label>
                  <p className="text-gray-900 font-medium">{profileData.student.motherName || "Not provided"}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 font-medium">{profileData.student.address || "Not provided"}</p>
                </div>
              </div>
            )}

            {/* Profile Details - Staff */}
            {role === "staff" && profileData?.staff && (
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.employeeId || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.department || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Designation</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.designation || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 font-medium">{formatDate(profileData.staff.dob)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.gender || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.bloodGroup || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.mobileNumber || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Number</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.emergencyNumber || "Not provided"}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Qualification</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.qualification || "Not provided"}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.address || "Not provided"}</p>
                </div>
              </div>
            )}

            {/* Profile Details - Admin */}
            {role === "admin" && profileData?.admin && (
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Admin ID</label>
                  <p className="text-gray-900 font-medium">{profileData.admin.adminId || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 font-medium">{profileData.admin.department || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Designation</label>
                  <p className="text-gray-900 font-medium">{profileData.admin.designation || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 font-medium">{formatDate(profileData.admin.dob)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900 font-medium">{profileData.admin.gender || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-gray-900 font-medium">{profileData.admin.mobileNumber || "Not provided"}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 font-medium">{profileData.admin.address || "Not provided"}</p>
                </div>
              </div>
            )}

            {/* No profile data found */}
            {!profileData?.student && !profileData?.staff && !profileData?.admin && (
              <div className="col-span-2">
                <p className="text-gray-500 text-center py-8">
                  No profile information available. Please complete your profile.
                </p>
                <div className="text-center">
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Complete Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
