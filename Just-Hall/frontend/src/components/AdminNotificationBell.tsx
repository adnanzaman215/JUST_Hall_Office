"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminNotificationBell() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/applications/pending/count');
      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching pending applications count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      href="/admin/applications"
      className="relative p-2 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-gray-800 transition-all"
      title="View pending applications"
    >
      {/* Bell Icon */}
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
        />
      </svg>
      
      {/* Notification Badge */}
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
      
      {/* Pulse Effect for New Notifications */}
      {pendingCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 rounded-full bg-red-500 opacity-75 animate-ping"></span>
      )}
    </Link>
  );
}
