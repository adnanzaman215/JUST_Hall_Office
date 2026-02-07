"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Search, Filter, Eye, UserCog, Mail, Phone, Calendar } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface Staff {
  id: number;
  userId: number;
  employeeId: string;
  staffType: string;
  designation: string;
  status: string;
  joiningDate: string | null;
  dob: string | null;
  gender: string;
  bloodGroup: string;
  mobileNumber: string;
  emergencyNumber: string;
  address: string;
  photoUrl: string | null;
  roleRequestCount: number;
  pendingRoleRequest?: {
    id: number;
    requestedRole: string;
    remarks?: string;
    requestedAt: string;
    status: string;
  };
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  };
}

export default function StaffManagement() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    if (!authLoading && !token) {
      setError("Please login to access this page");
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    if (!authLoading && token) {
      fetchStaff();
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    filterStaffList();
  }, [searchQuery, filterType, filterStatus, staffList]);

  const fetchStaff = async () => {
    try {
      if (!token) {
        setError("Authorization token not found");
        return;
      }

      const response = await fetch("http://localhost:8000/api/staff/all", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("You don't have permission to access this page");
          setTimeout(() => router.push("/"), 2000);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch staff data");
      }

      const data = await response.json();
      setStaffList(data.staff || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError(err instanceof Error ? err.message : "An error occurred while fetching staff data");
    } finally {
      setLoading(false);
    }
  };

  const filterStaffList = () => {
    let filtered = [...staffList];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((staff) =>
        staff.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "All") {
      filtered = filtered.filter((staff) => staff.staffType === filterType);
    }

    // Status filter
    if (filterStatus !== "All") {
      filtered = filtered.filter((staff) => staff.status === filterStatus);
    }

    setFilteredStaff(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: "bg-green-100 text-green-700 border-green-300",
      Inactive: "bg-gray-100 text-gray-700 border-gray-300",
      OnLeave: "bg-amber-100 text-amber-700 border-amber-300",
      Suspended: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  const getStaffTypeBadge = (type: string) => {
    const styles = {
      Teaching: "bg-blue-100 text-blue-700 border-blue-300",
      "Non-Teaching": "bg-purple-100 text-purple-700 border-purple-300",
      Administrative: "bg-indigo-100 text-indigo-700 border-indigo-300",
      "Hall Staff": "bg-cyan-100 text-cyan-700 border-cyan-300",
    };
    return styles[type as keyof typeof styles] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Staff Management</h1>
              <p className="text-gray-600">Manage staff profiles, roles, and status</p>
            </div>
            <Link
              href="/admin/role-requests"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <UserCog className="h-5 w-5" />
              Role Requests
            </Link>
          </div>
        </div>

      {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-gray-600">Total Staff</p>
            <p className="text-2xl font-semibold text-gray-900">{staffList.length}</p>
          </div>
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-semibold text-gray-900">
              {staffList.filter((s) => s.status === "Active").length}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-gray-600">Teaching</p>
            <p className="text-2xl font-semibold text-gray-900">
              {staffList.filter((s) => s.staffType === "Teaching").length}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-gray-600">Non-Teaching</p>
            <p className="text-2xl font-semibold text-gray-900">
              {staffList.filter((s) => s.staffType === "Non-Teaching").length}
            </p>
          </div>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or employee ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-black"
            />
          </div>

          {/* Staff Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-black"
            >
              <option value="All">All Staff Types</option>
              <option value="Teaching">Teaching</option>
              <option value="Non-Teaching">Non-Teaching</option>
              <option value="Administrative">Administrative</option>
              <option value="Hall Staff">Hall Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-black"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="OnLeave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>No staff members found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {staff.photoUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`http://localhost:8000/media/${staff.photoUrl}`}
                              alt={staff.user.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {staff.user.fullName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {staff.user.fullName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {staff.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {staff.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStaffTypeBadge(
                          staff.staffType
                        )}`}
                      >
                        {staff.staffType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {staff.designation || (
                          <span className="text-gray-400 italic">Not assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                          staff.status
                        )}`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.pendingRoleRequest ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300 inline-block w-fit">
                            ⏳ Pending
                          </span>
                          <span className="text-xs text-gray-700 font-semibold">
                            {staff.pendingRoleRequest.requestedRole}
                          </span>
                          <Link 
                            href="/admin/role-requests"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Request →
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {staff.mobileNumber || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </div>
                      {staff.joiningDate && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Joined: {new Date(staff.joiningDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/staff/${staff.id}`)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredStaff.length} of {staffList.length} staff members
        </div>
      </div>
    </div>
  );
}
