"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Briefcase, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface Staff {
  id: number;
  userId: number;
  employeeId: string;
  staffType: string;
  designation: string;
  department: string;
  status: string;
  joiningDate: string | null;
  dob: string | null;
  gender: string;
  bloodGroup: string;
  mobileNumber: string;
  emergencyNumber: string;
  address: string;
  qualification: string;
  photoUrl: string | null;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export default function StaffProfileView() {
  const router = useRouter();
  const params = useParams();
  const { token, isLoading: authLoading } = useAuth();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const staffId = params?.id;

  useEffect(() => {
    if (!authLoading && !token) {
      setError("Please login to access this page");
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    if (!authLoading && token && staffId) {
      fetchStaffDetails();
    }
  }, [authLoading, token, staffId, router]);

  const fetchStaffDetails = async () => {
    try {
      if (!token) {
        setError("Authorization token not found");
        return;
      }

      const response = await fetch(`http://localhost:8000/api/staff/${staffId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Staff member not found");
          return;
        }
        if (response.status === 401 || response.status === 403) {
          setError("You don't have permission to view this profile");
          setTimeout(() => router.push("/admin/staff"), 2000);
          return;
        }
        throw new Error("Failed to fetch staff details");
      }

      const data = await response.json();
      console.log("Staff data received:", data);
      
      if (data.staff) {
        // Ensure user object exists
        if (!data.staff.user) {
          console.error("User data is missing from staff object");
          setError("Staff profile data is incomplete");
          return;
        }
        setStaff(data.staff);
      } else {
        setError("Invalid staff data received");
      }
    } catch (err) {
      console.error("Error fetching staff details:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching staff details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-bold text-red-900">Error</h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push("/admin/staff")}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Staff List
          </button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Staff member not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin/staff")}
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Staff List
          </button>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Staff Profile</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(staff.status)}`}>
                {staff.status}
              </span>
            </div>
            <p className="text-gray-600 mt-1">View-only mode</p>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                {staff.photoUrl ? (
                  <img
                    src={`http://localhost:8000${staff.photoUrl}`}
                    alt={staff.user?.fullName || 'Staff Photo'}
                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="h-20 w-20 text-white" />
                  </div>
                )}
              </div>

              {/* Name and Employee ID */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{staff.user?.fullName || 'N/A'}</h2>
                <p className="text-gray-600 font-medium">Employee ID: {staff.employeeId}</p>
                <p className="text-sm text-gray-500 mt-1">{staff.designation}</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Staff Type</p>
                  <p className="font-semibold text-gray-900">{staff.staffType}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="font-semibold text-gray-900">{staff.department}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                  <p className="font-semibold text-gray-900">{staff.bloodGroup}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-cyan-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{staff.user?.email || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{staff.mobileNumber}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Emergency Contact</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{staff.emergencyNumber}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="line-clamp-2">{staff.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(staff.dob)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                  <span className="text-gray-900">{staff.gender}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                  <span className="text-gray-900">{staff.bloodGroup}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Qualification</label>
                  <span className="text-gray-900">{staff.qualification}</span>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-cyan-600" />
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Employee ID</label>
                  <span className="text-gray-900 font-mono">{staff.employeeId}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Staff Type</label>
                  <span className="text-gray-900">{staff.staffType}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Designation</label>
                  <span className="text-gray-900">{staff.designation}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
                  <span className="text-gray-900">{staff.department}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Joining Date</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(staff.joiningDate)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(staff.status)}`}>
                    {staff.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-600" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                  <span className="text-gray-900 font-mono">#{staff.userId}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Account Role</label>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">
                    {staff.user?.role || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
