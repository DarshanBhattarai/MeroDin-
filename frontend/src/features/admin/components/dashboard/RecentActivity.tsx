// src/app/admin/components/dashboard/RecentActivity.tsx
"use client";

import { useEffect, useState } from "react";
import * as adminService from "@/features/admin/services/adminService";

interface Activity {
  id: number;
  userId: number;
  user: {
    id: number;
    email: string;
    fullName: string | null;
  };
  otpType: string;
  success: boolean;
  createdAt: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const response = await adminService.getSystemLogs({ limit: 10 });
      setActivities(response.logs);
    } catch (error) {
      console.error("Failed to fetch activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, success: boolean) => {
    if (!success) return "❌";

    const icons: { [key: string]: string } = {
      EMAIL_VERIFY: "📧",
      PASSWORD_RESET: "🔑",
      LOGIN: "🔐",
    };
    return icons[type] || "📝";
  };

  const getActivityText = (activity: Activity) => {
    const baseText = activity.success ? "completed" : "failed";

    const types: { [key: string]: string } = {
      EMAIL_VERIFY: `Email verification ${baseText}`,
      PASSWORD_RESET: `Password reset ${baseText}`,
      LOGIN: `Login ${baseText}`,
    };

    return types[activity.otpType] || `${activity.otpType} ${baseText}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button
          onClick={fetchRecentActivity}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  activity.success
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {getActivityIcon(activity.otpType, activity.success)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.user.fullName || activity.user.email}
                </p>
                <p className="text-sm text-gray-600">
                  {getActivityText(activity)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(activity.createdAt)}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {activity.otpType.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}
