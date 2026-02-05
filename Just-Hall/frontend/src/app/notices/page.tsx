"use client";
import React, { useState, useEffect } from "react";
import { noticesAPI, Notice, BACKEND_URL } from "@/lib/api";

const categories = [
  "All",
  "General",
  "Seat Allocation",
  "Maintenance",
  "Fee Notice",
  "Event",
  "Circular",
  "Emergency",
];

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    filterNotices();
  }, [notices, selectedCategory, searchQuery]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noticesAPI.getNotices();
      setNotices(data);
    } catch (err) {
      setError("Failed to load notices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterNotices = () => {
    let filtered = notices;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (notice) => notice.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(query) ||
          notice.body.toLowerCase().includes(query)
      );
    }

    setFilteredNotices(filtered);
  };

  // Helper function to get full file URL
  const getFileUrl = (url: string | null | undefined) => {
    if (!url) return "";
    if (url.startsWith("http")) return url; // Already full URL
    return `${BACKEND_URL}${url}`; // Prepend backend URL
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: "bg-blue-100 text-blue-800",
      "seat allocation": "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      "fee notice": "bg-purple-100 text-purple-800",
      event: "bg-pink-100 text-pink-800",
      circular: "bg-indigo-100 text-indigo-800",
      emergency: "bg-red-100 text-red-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-black text-white">Notice Board</h1>
          </div>
          <p className="text-cyan-50 text-xl font-medium">
            Stay updated with the latest hall announcements and circulars
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-cyan-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search All Notices ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none text-gray-700 placeholder-gray-400 font-medium text-lg transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm ${
                  selectedCategory === category
                    ? "bg-cyan-500 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-cyan-500 hover:text-cyan-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 font-semibold text-lg">Loading notices...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-8 py-5 rounded-r-2xl mb-6 shadow-md">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Notices Grid */}
        {!loading && !error && (
          <>
            {filteredNotices.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Notices Found</h3>
                <p className="text-gray-500 text-base">There are no notices matching your criteria. Try changing your filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-b-4 border-cyan-500"
                  >
                    <div className="p-8">
                      {/* Header Section with Date and Download */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-cyan-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-bold text-base">
                            {formatDate(notice.createdAt)}
                          </span>
                        </div>

                        {/* Download Button */}
                        {notice.attachmentUrl && (
                          <a
                            href={getFileUrl(notice.attachmentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-lime-400 to-lime-500 text-gray-900 font-extrabold rounded-lg hover:from-lime-500 hover:to-lime-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Download
                          </a>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-black text-black mb-4 leading-tight">
                        {notice.title}
                      </h2>

                      {/* Body */}
                      <p className="text-base text-gray-700 leading-relaxed mb-6">
                        {notice.body}
                      </p>

                      {/* Attachment Badge */}
                      {notice.attachmentUrl && (
                        <div className="mb-6">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-lime-100 text-lime-800 rounded-lg font-bold text-sm border border-lime-300">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            PDF Attached
                          </span>
                        </div>
                      )}

                      {/* Tags Section */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-gray-700 text-sm">Tags:</span>
                        <span className="px-4 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-bold">
                          {notice.category}
                        </span>
                        {notice.pinned && (
                          <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.293a1 1 0 010 1.414l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L10 10.586l2.293-2.293a1 1 0 011.414 0z" />
                            </svg>
                            Pinned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Marquee Section */}
        <div className="mt-10 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-r-2xl p-5 shadow-md overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-black text-amber-900 flex-shrink-0 text-lg">Important:</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-amber-800 font-semibold text-base">
                  Stay updated with the latest hall announcements • Download PDF attachments for detailed information • Check regularly for important updates • Contact administration for any queries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
