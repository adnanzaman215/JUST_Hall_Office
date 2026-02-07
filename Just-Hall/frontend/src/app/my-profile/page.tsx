"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";

interface RoleRequest {
  id: number;
  requestedRole: string;
  status: string;
  remarks?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedByName?: string;
}

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Role request states
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [showRoleRequestModal, setShowRoleRequestModal] = useState(false);
  const [requestedRole, setRequestedRole] = useState("");
  const [requestRemarks, setRequestRemarks] = useState("");
  const [roleRequestLoading, setRoleRequestLoading] = useState(false);
  const [roleRequestError, setRoleRequestError] = useState<string | null>(null);
  const [roleRequestSuccess, setRoleRequestSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const userData = getStoredUser();
    
    if (!token || !userData) {
      router.push("/");
      return;
    }

    setUser(userData);
    const userRole = userData.role?.toLowerCase() || "student";
    setRole(userRole);
    fetchProfile(token);
    
    // Fetch role requests if user is staff
    if (userRole === "staff") {
      fetchRoleRequests(token);
    }
  }, [router]);

  const fetchRoleRequests = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/role-requests/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRoleRequests(data.roleRequests || []);
      }
    } catch (error) {
      console.error('Error fetching role requests:', error);
    }
  };

  const handleRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleRequestLoading(true);
    setRoleRequestError(null);
    setRoleRequestSuccess(null);

    try {
      const token = getStoredToken();
      if (!token) {
        setRoleRequestError('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:8000/api/role-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          requestedRole,
          remarks: requestRemarks.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRoleRequestSuccess(data.message);
        setRequestedRole('');
        setRequestRemarks('');
        setShowRoleRequestModal(false);
        
        const token2 = getStoredToken();
        if (token2) {
          await fetchRoleRequests(token2);
        }
      } else {
        setRoleRequestError(data.message || 'Failed to submit role request');
      }
    } catch (error: any) {
      setRoleRequestError(error.message || 'Failed to submit role request');
    } finally {
      setRoleRequestLoading(false);
    }
  };

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
      {/* Role Request Modal */}
      {showRoleRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Service Role</h3>
              <button
                onClick={() => {
                  setShowRoleRequestModal(false);
                  setRequestedRole('');
                  setRequestRemarks('');
                  setRoleRequestError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {roleRequestError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {roleRequestError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested Role *
                </label>
                <input
                  type="text"
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
                  placeholder="e.g., Hall Provost, Assistant Provost"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  value={requestRemarks}
                  onChange={(e) => setRequestRemarks(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
                  placeholder="Add any additional information..."
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleRequestModal(false);
                    setRequestedRole('');
                    setRequestRemarks('');
                    setRoleRequestError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRoleRequest}
                  disabled={!requestedRole.trim() || roleRequestLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {roleRequestLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <label className="text-sm font-medium text-gray-500">Staff Type</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.staffType || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Role</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.designation || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joining Date</label>
                  <p className="text-gray-900 font-medium">{formatDate(profileData.staff.joiningDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900 font-medium">{profileData.staff.status || "Not provided"}</p>
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
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 font-medium">{user?.email || "Not provided"}</p>
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
            {/* Role Request Section for Staff */}
            {role === "staff" && profileData?.staff && (
              <div className="col-span-full mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Role Request</h3>
                  
                  {roleRequestSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      {roleRequestSuccess}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Current Role Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Current Service Role</label>
                        <p className="text-gray-900 font-medium text-lg">{profileData.staff.designation || "Not assigned"}</p>
                      </div>
                      
                      {/* Request Status */}
                      {roleRequests.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 block mb-1">Latest Request Status</label>
                          <div className="flex gap-2 items-center">
                            {roleRequests[0]?.status === 'Pending' && (
                              <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                                ⏳ Pending
                              </span>
                            )}
                            {roleRequests[0]?.status === 'Approved' && (
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                ✓ Approved
                              </span>
                            )}
                            {roleRequests[0]?.status === 'Rejected' && (
                              <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                                ✕ Rejected
                              </span>
                            )}
                            {roleRequests[0]?.status === 'Approved' && (
                              <span className="text-sm text-green-700">for {roleRequests[0].requestedRole}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Request Button */}
                    {!roleRequests.some(r => r.status === 'Pending') && (
                      <button
                        onClick={() => setShowRoleRequestModal(true)}
                        disabled={roleRequestLoading}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {roleRequests.some(r => r.status === 'Approved') ? 'Request Role Change' : 'Request Job Role'}
                      </button>
                    )}

                    {/* Request History */}
                    {roleRequests.length > 0 && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-600 block mb-2">Request History</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {roleRequests.map((req) => (
                            <div key={req.id} className="bg-white p-3 rounded border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{req.requestedRole}</p>
                                  <p className="text-xs text-gray-500 mt-1">Requested: {new Date(req.requestedAt).toLocaleDateString()}</p>
                                  {req.remarks && <p className="text-sm text-gray-600 mt-1">Remarks: {req.remarks}</p>}
                                </div>
                                <div className="text-right ml-2">
                                  {req.status === 'Pending' && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Pending</span>}
                                  {req.status === 'Approved' && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Approved</span>}
                                  {req.status === 'Rejected' && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Rejected</span>}
                                </div>
                              </div>
                              {req.reviewedByName && (
                                <p className="text-xs text-gray-500 mt-2">Reviewed by: {req.reviewedByName}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
