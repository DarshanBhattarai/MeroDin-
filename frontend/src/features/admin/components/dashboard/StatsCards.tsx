// src/app/admin/components/dashboard/StatsCards.tsx
"use client";

import { useEffect, useState } from "react";
import * as adminService from "@/features/admin/services/adminService";

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  activeUsersToday: number;
  newRegistrationsToday: number;
  totalDiaryEntries: number;
  diaryEntriesToday: number;
  verifiedUsers: number;
  oauthUsers: number;
  emailUsers: number;
  systemHealth: string;
  database: string;
  lastUpdated: string;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdminStats();
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400 text-lg mr-3">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">
              Failed to load statistics
            </h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newRegistrationsToday} today`,
      icon: "👥",
      color: "blue",
    },
    {
      title: "Active Today",
      value: stats.activeUsersToday.toLocaleString(),
      change: `${Math.round(
        (stats.activeUsersToday / stats.totalUsers) * 100
      )}% of total`,
      icon: "🔥",
      color: "green",
    },
    {
      title: "Diary Entries",
      value: stats.totalDiaryEntries.toLocaleString(),
      change: `+${stats.diaryEntriesToday} today`,
      icon: "📝",
      color: "purple",
    },
    {
      title: "Verified Users",
      value: stats.verifiedUsers.toLocaleString(),
      change: `${Math.round(
        (stats.verifiedUsers / stats.totalUsers) * 100
      )}% verified`,
      icon: "✅",
      color: "indigo",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${getColorClasses(
                stat.color
              )}`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
