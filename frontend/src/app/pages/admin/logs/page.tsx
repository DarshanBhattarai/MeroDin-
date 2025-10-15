"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/app/layouts/AdminLayout";
import SystemLogsTable from "@/features/admin/components/system-logs/SystemLogsTable";
import { getSystemLogs } from "@/features/admin/services/adminService";
import { SystemLogsResponse } from "@/types/admin";

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSystemLogs({ page, limit: 20 });
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch system logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-600 mt-1">
              Monitor system activities and OTP attempts
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {logs?.pagination?.totalCount || 0} logs
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading logs
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logs Table */}
        <SystemLogsTable
          logs={logs?.logs || []}
          loading={loading}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          totalPages={logs?.pagination?.totalPages || 1}
        />
      </div>
    </AdminLayout>
  );
}