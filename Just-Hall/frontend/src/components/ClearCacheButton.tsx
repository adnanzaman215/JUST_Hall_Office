"use client";
import { clearAuthData } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';

export default function ClearCacheButton() {
  const { logout } = useAuth();

  const handleClearCache = () => {
    // Clear all authentication data
    clearAuthData();
    
    // Update auth context
    logout();
    
    // Clear any other localStorage items that might be cached
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    
    // Reload the page to ensure clean state
    window.location.reload();
  };

  return (
    <button
      onClick={handleClearCache}
      className="fixed bottom-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium"
      title="Clear all cached authentication data (Development only)"
    >
      🗑️ Clear Cache
    </button>
  );
}