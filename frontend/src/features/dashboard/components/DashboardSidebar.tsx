"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/features/auth/services/authService";

const navigationItems = [
  { name: "Dashboard", href: "/pages/dashboard", icon: LayoutDashboard },
  { name: "My Diary", href: "/pages/entries", icon: BookOpen },
  { name: "New Entry", href: "/pages/entries/create", icon: PlusCircle },
  { name: "Calendar", href: "/pages/calendar", icon: Calendar },
  { name: "Analytics", href: "/pages/analytics", icon: BarChart3 },
  { name: "Settings", href: "/pages/settings", icon: Settings },
];

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const handleLogout = async () => {
    try {
      const res = await logout();
      console.log(res.message); // optional: you can show a toast or redirect
      // redirect to login page after logout
      window.location.href = "/pages/auth/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">MyDiary</h1>
        <p className="text-sm text-gray-600">Your personal journal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
