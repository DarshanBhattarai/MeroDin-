'use client';

import React from "react";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";
import { MonthNavigation } from "@/features/calendar/components/MonthNavigation";
import { CalendarGrid } from "@/features/calendar/components/CalendarGrid";
import { useCalendar } from "@/features/calendar/hooks/useCalendar";
import { useRouter } from "next/navigation";

export default function CalendarDashboardPage() {
  const {
    currentDate,
    calendarDays,
    loading,
    error,
    navigateMonth,
    goToToday,
    setCurrentDate,
  } = useCalendar();

  const router = useRouter();

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    router.push(`/calendar/${dateString}`);
  };

  const handleEntrySelect = (entry: any) => {
    router.push(`/entries/${entry.id}`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Diary Calendar
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View and manage your daily diary entries. Click on any day to
              view or create entries.
            </p>
          </div>

          {/* Month Navigation */}
          <MonthNavigation
            currentDate={currentDate}
            onNavigate={navigateMonth}
            onToday={goToToday}
            onDateChange={setCurrentDate}
          />

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Loading calendar...</div>
              </div>
            </div>
          ) : (
            <CalendarGrid
              calendarDays={calendarDays}
              onDateSelect={handleDateSelect}
              onEntrySelect={handleEntrySelect}
            />
          )}

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Calendar Legend
            </h3>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-50 ring-2 ring-blue-500 rounded"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span className="text-gray-600">Happy Mood</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span className="text-gray-600">Sad Mood</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-gray-600">Excited Mood</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="text-gray-600">Angry Mood</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
