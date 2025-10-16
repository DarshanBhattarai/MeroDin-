"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";
import { RecentEntries } from "@/features/dashboard/components/RecentEntries";
import { DiaryStats } from "@/features/dashboard/components/DiaryStats";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import {
  useDiary,
  useDiaryAnalytics,
} from "@/features/entities/hooks/useDiary";

export default function DashboardPage() {
  const router = useRouter();
  const { entries, fetchMyEntries, error, isLoading } = useDiary();
  const { stats, fetchAnalytics, loading: analyticsLoading } = useDiaryAnalytics();
  
  const isLoaded = React.useRef(false);

  React.useEffect(() => {
    if (isLoaded.current) return;
    isLoaded.current = true;

    const loadData = async () => {
      try {
        await Promise.all([fetchMyEntries(), fetchAnalytics()]);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);

        // Handle auth errors
        if (
          err instanceof Error &&
          err.message.includes("Authentication failed")
        ) {
          router.push("/pages/auth/login");
        }
      }
    };

    loadData();
  }, [fetchMyEntries, fetchAnalytics, router]);

  // Determine loading state dynamically
  const isFetchingEntries = isLoading("fetchMyEntries");
  const isFetchingAnalytics = analyticsLoading;
  const loading = isFetchingEntries || isFetchingAnalytics;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">
              Here's what's been happening in your diary.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && !error && (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading your dashboard...</div>
            </div>
          )}

          {/* Stats Cards */}
          {!loading && stats && <DiaryStats stats={stats} />}

          {/* Quick Actions */}
          {!loading && <QuickActions />}

          {/* Recent Entries */}
          {!loading && (
            <div className="mt-8">
              <RecentEntries entries={entries} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
