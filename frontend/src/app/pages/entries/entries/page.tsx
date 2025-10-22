"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchEntriesThunk } from "@/features/entities/redux/diaryThunks";
import { securityUtils } from "@/utils/securityUtils";

export default function EntriesListPage() {
  const dispatch = useAppDispatch();
  const { entries, loading, error } = useAppSelector((state) => state.diary);

  useEffect(() => {
    dispatch(fetchEntriesThunk({})); // ✅ Fetch all diary entries
  }, [dispatch]);

  // 🕓 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          Loading entries...
        </div>
      </div>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // 📭 Empty state
  if (!entries || entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            No entries found
          </h2>
          <p className="text-gray-500 mt-2">
            Start your first diary entry now!
          </p>
          <Link
            href="/entries/create"
            className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Entry
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Securely decrypt all entries before rendering
  const safeEntries = entries.map((entry) => ({
    ...entry,
    title: securityUtils.decryptData(entry.title),
    contentRaw: securityUtils.decryptData(entry.contentRaw),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Diary Entries</h1>
          <Link
            href="/entries/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Entry
          </Link>
        </div>

        {/* Entries list */}
        <div className="space-y-4">
          {safeEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <Link
                href={`/entries/${entry.id}`}
                className="block hover:bg-gray-50 -m-6 p-6 rounded-lg"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {entry.title || "Untitled Entry"}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mt-2 line-clamp-2">
                  {entry.contentRaw?.substring(0, 150) || "No content"}...
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
