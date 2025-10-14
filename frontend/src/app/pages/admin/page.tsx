// src/app/admin/page.tsx
"use client";

import StatsCards from "@/features/admin/components/dashboard/StatsCards"; // Fixed import path
import RecentActivity from "@/features/admin/components/dashboard/RecentActivity"; // Fixed import path
import SystemHealth from "@/features/admin/components/dashboard/SystemHealth"; // Fixed import path

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">
          Monitor your system performance and user activity
        </p>
      </div>

      {/* Stats Grid */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* System Health */}
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>
      </div>
    </div>
  );
}