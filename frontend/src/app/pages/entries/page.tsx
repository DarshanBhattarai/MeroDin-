"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DiaryEntryCard } from "@/features/entities/components/DiaryEntryCard";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";
import { DiaryType, DiaryFilters } from "@/types/diary";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchEntriesThunk, deleteEntryThunk } from "@/features/entities/redux/diaryThunks";

export default function EntriesPage() {
  const dispatch = useAppDispatch();
  const { entries, loading, error } = useAppSelector((state) => state.diary);

  const [filters, setFilters] = useState<DiaryFilters>({});

  // Fetch entries on mount or when filters change
  useEffect(() => {
    dispatch(fetchEntriesThunk(filters));
  }, [dispatch, filters]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    dispatch(deleteEntryThunk(id));
  };

  const safeEntries = Array.isArray(entries) ? entries : [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Diary Entries
              </h1>
              <p className="text-gray-600 mt-2">
                Your personal thoughts and memories
              </p>
            </div>
            <Link
              href="/pages/entries/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Entry
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.diaryType || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    diaryType: e.target.value ? (e.target.value as DiaryType) : undefined,
                  }))
                }
                className="border border-gray-300 rounded p-2"
              >
                <option value="">All Types</option>
                {(['NORMAL','SECRET','MEMORY','QUICK_NOTE'] as DiaryType[]).map((type) => (
                  <option key={type} value={type}>{type.replace("_", " ")}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Mood"
                value={filters.mood || ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, mood: e.target.value || undefined }))}
                className="border border-gray-300 rounded p-2"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && safeEntries.length === 0 && (
            <div className="text-center py-12">Loading your diary entries...</div>
          )}

          {/* Entries */}
          {safeEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {error ? "Failed to load entries" : "No diary entries yet. Start writing your story!"}
              </div>
              <Link
                href="/pages/entries/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Entry
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeEntries.map((entry) => (
                <DiaryEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
