// src/components/NoticeBoardClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import NoticeBoard from "@/components/NoticeBoard";

export default function NoticeBoardClient() {
  const { user: authUser, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is admin (case-insensitive)
  const isAdmin = authUser?.role?.toLowerCase() === "admin" || 
                  authUser?.isAdmin === true;

  const handleRefreshSession = () => {
    if (confirm("This will log you out. Please log back in to refresh your session data.")) {
      logout();
    }
  };

  if (!mounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      {/* Debug Panel - Remove in production */}
      {authUser && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-yellow-900">🔧 Debug Info (Development Only)</h3>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
            >
              {showDebug ? "Hide" : "Show"} Details
            </button>
          </div>
          
          {showDebug && (
            <div className="space-y-2 text-sm mb-3">
              <p><strong>Email:</strong> {authUser.email}</p>
              <p><strong>Role from API:</strong> {authUser.role || "❌ NOT SET"}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? "✅ YES" : "❌ NO"}</p>
              <p><strong>Can Manage Notices:</strong> {isAdmin ? "✅ YES" : "❌ NO"}</p>
            </div>
          )}
          
          {!authUser.role && (
            <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded">
              <p className="text-red-800 font-semibold">⚠️ Role not found in session!</p>
              <p className="text-red-700 text-sm mt-1">Your session was created before the role field was added.</p>
            </div>
          )}
          
          <button
            onClick={handleRefreshSession}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-sm"
          >
            🔄 Refresh Session (Logout & Re-login)
          </button>
        </div>
      )}

      <NoticeBoard canManage={isAdmin} />
    </>
  );
}
