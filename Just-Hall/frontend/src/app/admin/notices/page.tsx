"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { noticesAPI, Notice, CreateNoticeRequest, UpdateNoticeRequest, BACKEND_URL } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";

const categories = [
  "General",
  "Seat Allocation",
  "Maintenance",
  "Fee Notice",
  "Event",
  "Circular",
  "Emergency",
];

// Helper function to get full file URL
const getFileUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

type NoticeStatus = "PendingReview" | "Published" | "Rejected";

export default function AdminNoticeManagement() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingNotice, setReviewingNotice] = useState<Notice | null>(null);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"All" | NoticeStatus>("All");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "General",
    author: "",
    pinned: false,
    attachmentUrl: "",
    expiresAt: "",
    publishNow: false,
  });

  // Review form state
  const [reviewData, setReviewData] = useState({
    status: "Published" as "Published" | "Rejected",
    remarks: "",
  });

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role?.toLowerCase() !== "admin") {
      router.push("/");
      return;
    }
    fetchNotices();
  }, [router]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getStoredToken();
      if (!token) {
        setError("Authentication required");
        return;
      }
      // Use admin endpoint to get all notices with workflow data
      const data = await noticesAPI.getAllNotices(token);
      setNotices(data);
    } catch (err) {
      setError("Failed to load notices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = statusFilter === "All" 
    ? notices 
    : notices.filter(n => n.status === statusFilter);

  const handleOpenModal = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData({
        title: notice.title,
        body: notice.body,
        category: notice.category,
        author: notice.author,
        pinned: notice.pinned,
        attachmentUrl: notice.attachmentUrl || "",
        expiresAt: notice.expiresAt ? notice.expiresAt.split("T")[0] : "",
        publishNow: false,
      });
      setUploadedFileName(notice.attachmentUrl ? notice.attachmentUrl.split("/").pop() || "" : "");
    } else {
      setEditingNotice(null);
      const user = getStoredUser();
      setFormData({
        title: "",
        body: "",
        category: "General",
        author: user?.fullName || "Admin",
        pinned: false,
        attachmentUrl: "",
        expiresAt: "",
        publishNow: true, // Admin can publish directly by default
      });
      setUploadedFileName("");
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNotice(null);
    setSelectedFile(null);
    setUploadedFileName("");
    setError(null);
  };

  const handleOpenReviewModal = (notice: Notice) => {
    setReviewingNotice(notice);
    setReviewData({ status: "Published", remarks: "" });
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewingNotice(null);
    setReviewData({ action: "publish", remarks: "" });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingNotice) return;
    
    const token = getStoredToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await noticesAPI.reviewNotice(
        reviewingNotice.id,
        {
          status: reviewData.status,
          remarks: reviewData.remarks || undefined,
        },
        token
      );
      await fetchNotices();
      handleCloseReviewModal();
    } catch (err: any) {
      setError(err.message || "Failed to review notice");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStoredToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let attachmentUrl = formData.attachmentUrl;

      // Upload file if selected
      if (selectedFile) {
        setUploadingFile(true);
        try {
          const uploadResult = await noticesAPI.uploadAttachment(selectedFile, token);
          attachmentUrl = uploadResult.url;
          setUploadedFileName(uploadResult.fileName);
        } catch (uploadErr: any) {
          setError(uploadErr.message || "Failed to upload file");
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      const noticeData: any = {
        title: formData.title,
        body: formData.body,
        category: formData.category,
        author: formData.author,
        pinned: formData.pinned,
        attachmentUrl: attachmentUrl || undefined,
        expiresAt: formData.expiresAt || undefined,
      };

      if (!editingNotice) {
        // Only include publishNow when creating
        noticeData.publishNow = formData.publishNow;
      }

      if (editingNotice) {
        await noticesAPI.updateNotice(editingNotice.id, noticeData, token);
      } else {
        await noticesAPI.createNotice(noticeData as CreateNoticeRequest, token);
      }

      await fetchNotices();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = getStoredToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await noticesAPI.deleteNotice(id, token);
      await fetchNotices();
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete notice");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notice Management</h1>
              <p className="text-gray-600 mt-1">Review, publish, and manage hall notices</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Notice
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 border-t border-gray-200 pt-4">
            {(["All", "PendingReview", "Published", "Rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-50 text-gray-700 hover:bg-slate-100 border border-gray-200"
                }`}
              >
                {status === "PendingReview" ? "Pending Review" : status}
                {status === "All" && ` (${notices.length})`}
                {status !== "All" && ` (${notices.filter(n => n.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Notices Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewed By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No notices found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-bold text-black flex items-center gap-2">
                              {notice.title}
                              {notice.pinned && <span className="text-yellow-500">📌</span>}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">{notice.body}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {notice.createdByName || notice.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            notice.status === "Published"
                              ? "bg-green-100 text-green-800"
                              : notice.status === "PendingReview"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {notice.status === "PendingReview" ? "Pending Review" : notice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notice.submittedAt ? formatDate(notice.submittedAt) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notice.reviewedByName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {notice.status === "PendingReview" && (
                            <button
                              onClick={() => handleOpenReviewModal(notice)}
                              className="text-cyan-600 hover:text-cyan-900 font-medium"
                            >
                              Review
                            </button>
                          )}
                          {notice.status !== "PendingReview" && (
                            <button
                              onClick={() => handleOpenModal(notice)}
                              className="text-cyan-600 hover:text-cyan-900"
                            >
                              Edit
                            </button>
                          )}
                          {deleteConfirmId === notice.id ? (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleDelete(notice.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(notice.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingNotice ? "Edit Notice" : "Create New Notice"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black font-medium"
                      placeholder="Enter notice title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Body *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black font-medium"
                      placeholder="Enter notice content"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black font-medium"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black font-medium"
                        placeholder="Author name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      📎 Upload Attachment (PDF/Document)
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 hover:border-cyan-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                    />
                    {uploadedFileName && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Current file: {uploadedFileName}
                      </p>
                    )}
                    {selectedFile && (
                      <p className="text-sm text-cyan-600 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        New file selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Max file size: 10MB. Supported: PDF, Word, Excel, PowerPoint, Images</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Expires At
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pinned"
                        checked={formData.pinned}
                        onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <label htmlFor="pinned" className="ml-2 block text-sm font-bold text-gray-900">
                        Pin to top
                      </label>
                    </div>
                    {!editingNotice && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="publishNow"
                          checked={formData.publishNow}
                          onChange={(e) => setFormData({ ...formData, publishNow: e.target.checked })}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="publishNow" className="ml-2 block text-sm font-bold text-gray-900">
                          Publish immediately (bypass review)
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading || uploadingFile}
                      className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploadingFile ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading File...
                        </>
                      ) : loading ? (
                        "Saving..."
                      ) : editingNotice ? (
                        "Update Notice"
                      ) : (
                        "Create Notice"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && reviewingNotice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Notice</h2>
                  <button
                    onClick={handleCloseReviewModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Notice Details */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{reviewingNotice.title}</h3>
                  <p className="text-gray-700 mb-3">{reviewingNotice.body}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      {reviewingNotice.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      By: {reviewingNotice.createdByName || reviewingNotice.author}
                    </span>
                    {reviewingNotice.submittedAt && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        Submitted: {formatDate(reviewingNotice.submittedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Decision *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="Published"
                          checked={reviewData.status === "Published"}
                          onChange={(e) => setReviewData({ ...reviewData, status: "Published" })}
                          className="w-4 h-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-gray-900 font-medium">✓ Publish</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="Rejected"
                          checked={reviewData.status === "Rejected"}
                          onChange={(e) => setReviewData({ ...reviewData, status: "Rejected" })}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-gray-900 font-medium">✗ Reject</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">
                      Remarks {reviewData.status === "Rejected" && "*"}
                    </label>
                    <textarea
                      rows={4}
                      value={reviewData.remarks}
                      onChange={(e) => setReviewData({ ...reviewData, remarks: e.target.value })}
                      required={reviewData.status === "Rejected"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black font-medium"
                      placeholder={reviewData.status === "Rejected" ? "Provide reason for rejection..." : "Optional review notes..."}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 ${
                        reviewData.status === "Published"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {loading ? "Processing..." : reviewData.status === "Published" ? "Publish Notice" : "Reject Notice"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseReviewModal}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
