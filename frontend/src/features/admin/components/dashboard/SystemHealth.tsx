// src/app/admin/components/dashboard/SystemHealth.tsx
"use client";

import { useEffect, useState } from "react";
import * as adminService from "@/features/admin/services/adminService";

interface SystemStatus {
  status: "operational" | "degraded" | "down";
  message: string;
  lastChecked: string;
}

export default function SystemHealth() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await adminService.getAdminStats();
      setSystemStatus({
        status:
          response.stats.systemHealth === "operational"
            ? "operational"
            : "degraded",
        message: "All systems are running smoothly",
        lastChecked: new Date().toISOString(),
      });
    } catch (error) {
      setSystemStatus({
        status: "down",
        message: "Unable to connect to system",
        lastChecked: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      operational: "bg-green-100 text-green-800 border-green-200",
      degraded: "bg-yellow-100 text-yellow-800 border-yellow-200",
      down: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status as keyof typeof colors] || colors.operational;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      operational: "✅",
      degraded: "⚠️",
      down: "❌",
    };
    return icons[status as keyof typeof icons] || "❓";
  };

  const services = [
    { name: "Web Server", status: "operational" },
    { name: "Database", status: "operational" },
    { name: "Authentication", status: "operational" },
    { name: "Email Service", status: "operational" },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Health
        </h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        System Health
      </h3>

      {/* Overall Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Overall Status
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              systemStatus?.status || "operational"
            )}`}
          >
            {systemStatus?.status.toUpperCase()}
          </span>
        </div>
        <p className="text-sm text-gray-600">{systemStatus?.message}</p>
        <p className="text-xs text-gray-500 mt-2">
          Last checked:{" "}
          {systemStatus
            ? new Date(systemStatus.lastChecked).toLocaleTimeString()
            : "Never"}
        </p>
      </div>

      {/* Services Status */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Services</h4>
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  service.status === "operational"
                    ? "bg-green-500"
                    : service.status === "degraded"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">{service.name}</span>
            </div>
            <span className="text-xs text-gray-500 capitalize">
              {service.status}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={checkSystemHealth}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Refresh
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            View Logs
          </button>
        </div>
      </div>
    </div>
  );
}
