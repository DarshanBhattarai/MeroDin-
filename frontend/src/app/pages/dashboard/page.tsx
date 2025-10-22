"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";
import { RecentEntries } from "@/features/dashboard/components/RecentEntries";
import { DiaryStats } from "@/features/dashboard/components/DiaryStats";
import { QuickActions } from "@/features/dashboard/components/QuickActions";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchEntriesThunk } from "@/features/entities/redux/diaryThunks";
import { fetchAnalyticsThunk } from "@/features/entities/redux/diaryAnalyticsThunks";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { entries, loading: entriesLoading, error: entriesError } = useAppSelector(
    (state) => state.diary
  );
  const { stats, loading: analyticsLoading, error: analyticsError } = useAppSelector(
    (state) => state.diaryAnalytics
  );

  const safeEntries = Array.isArray(entries) ? entries : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchEntriesThunk({})).unwrap(),
          dispatch(fetchAnalyticsThunk()).unwrap(),
        ]);
      } catch (err) {
        console.error("❌ Failed to load dashboard data:", err);

        if (err instanceof Error && err.message.includes("Authentication failed")) {
          router.push("/pages/auth/login");
        }
      }
    };
    loadData();
  }, [dispatch, router]);

  const loading = entriesLoading || analyticsLoading;
  const error = entriesError || analyticsError;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Here’s what’s been happening in your diary.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {typeof error === "string" ? error : "Something went wrong while loading data."}
            </div>
          )}

          {/* Loading */}
          {loading && !error && (
            <div className="text-center py-8 text-gray-500">Loading your dashboard...</div>
          )}

          {/* Stats */}
          {!loading && stats && <DiaryStats stats={stats} />}

          {/* Quick Actions */}
          {!loading && <QuickActions />}

          {/* Recent Entries */}
          {!loading && (
            <div className="mt-8">
              <RecentEntries entries={safeEntries} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
