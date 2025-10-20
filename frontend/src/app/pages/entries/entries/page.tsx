"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchEntriesThunk } from "@/features/entities/redux/diaryThunks";

export default function EntriesListPage() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.diary.entries);
  const loading = useAppSelector((state) => state.diary.loading);
  const error = useAppSelector((state) => state.diary.error);

  useEffect(() => {
    dispatch(fetchEntriesThunk({})); // fetch all entries without filters
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Diary Entries</h1>
          <Link
            href="/entries/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            New Entry
          </Link>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-md p-6">
              <Link
                href={`/entries/${entry.id}`}
                className="block hover:bg-gray-50 -m-6 p-6 rounded-lg"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {entry.title}
                </h2>
                <p className="text-gray-600 mt-2">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-700 mt-2 line-clamp-2">
                  {entry.contentRaw.substring(0, 150)}...
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
