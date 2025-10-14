// src/app/admin/components/layout/AdminHeader.tsx
"use client";

import  useAuth  from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get display name based on available user properties
  const getDisplayName = () => {
    if (!user) return 'Admin';
    
    // Check what properties actually exist on your user object
    return (user as any).fullName || (user as any).name || user.email || 'Admin';
  };

  // Get first letter for avatar
  const getAvatarLetter = () => {
    if (!user) return 'A';
    
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Welcome back, {getDisplayName()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Admin Badge */}
          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
            ADMIN
          </span>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {getAvatarLetter()}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}