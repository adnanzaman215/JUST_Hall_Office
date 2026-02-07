"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface RoleRequest {
  id: number;
  staffId: number;
  staffName: string;
  requestedRole: string;
  status: string;
  remarks: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

export default function RoleRequestsManagement() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RoleRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"Approved" | "Rejected">("Approved");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !token) {
      setError("Please login to access this page");
      setTimeout(() => router.push("/"), 2000);
      return;
    }
    if (!authLoading && token) {
      fetchRoleRequests();
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    filterRequests();
  }, [selectedStatus, requests]);

  const fetchRoleRequests = async () => {
    try {
      if (!token) {
        setError("Authorization token not found");
        return;
      }

      const response = await fetch("http://localhost:8000/api/role-requests", {
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
        throw new Error("Failed to fetch role requests");
      }

      const data = await response.json();
      setRequests(data.roleRequests || data.RoleRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    const filtered = requests.filter(req => 
      selectedStatus === "All" ? true : req.status === selectedStatus
    );
    setFilteredRequests(filtered);
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      if (!token) {
        setError("Authentication required");
        setSubmitting(false);
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/role-requests/${selectedRequest.id}/review`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: reviewAction,
            remarks: reviewRemarks.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to review request");
      }

      // Refresh the requests list
      await fetchRoleRequests();
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewRemarks("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (request: RoleRequest, action: "Approved" | "Rejected") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Pending: "bg-amber-100 text-amber-700 border-amber-300",
      Approved: "bg-green-100 text-green-700 border-green-300",
      Rejected: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Role Request Management</h1>
          <p className="text-gray-600">Review and approve staff service role requests</p>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedStatus === status
                ? "bg-cyan-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status}
            {status !== "All" && (
              <span className="ml-2 px-2 py-0.5 bg-black/5 rounded-full text-xs">
                {requests.filter(r => r.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p>No {selectedStatus.toLowerCase()} requests found</p>
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.staffName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.requestedRole}</div>
                    {request.remarks && (
                      <div className="text-xs text-gray-500 mt-1">{request.remarks}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === "Pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openReviewModal(request, "Approved")}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewModal(request, "Rejected")}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {request.reviewedAt && (
                          <div>
                            Reviewed {new Date(request.reviewedAt).toLocaleDateString()}
                          </div>
                        )}
                        {request.reviewedByName && (
                          <div className="text-xs text-gray-500">By {request.reviewedByName}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {reviewAction === "Approved" ? "Approve" : "Reject"} Role Request
              </h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                  setReviewRemarks("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Staff:</p>
              <p className="font-medium text-gray-900">{selectedRequest.staffName}</p>
              <p className="text-sm text-gray-600 mt-2 mb-1">Requested Role:</p>
              <p className="font-medium text-gray-900">{selectedRequest.requestedRole}</p>
              {selectedRequest.remarks && (
                <>
                  <p className="text-sm text-gray-600 mt-2 mb-1">Request Remarks:</p>
                  <p className="text-sm text-gray-700">{selectedRequest.remarks}</p>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Remarks (Optional)
                </label>
                <textarea
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600 text-black"
                  placeholder="Add any comments about your decision..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedRequest(null);
                    setReviewRemarks("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={submitting}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                    reviewAction === "Approved"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting
                    ? "Processing..."
                    : reviewAction === "Approved"
                    ? "Approve Request"
                    : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
