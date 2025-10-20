"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  fetchEntryByDateThunk,
  deleteEntryThunk,
} from "@/features/entities/redux/diaryThunks";
import type { RootState } from "@/app/store";
import type { DiaryEntry } from "@/types/diary";

export default function DiaryEntryPage() {
  const { date: dateParam } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentEntry, loading, error } = useAppSelector(
    (state: RootState) => state.diary
  );

  useEffect(() => {
    if (dateParam) {
      // Ensure it's a string
      const dateStr = Array.isArray(dateParam) ? dateParam[0] : dateParam;
      dispatch(fetchEntryByDateThunk(dateStr));
    }
  }, [dispatch, dateParam]);

  const handleDelete = async () => {
    if (!currentEntry) return;

    if (
      confirm(
        "Are you sure you want to delete this entry? This action cannot be undone."
      )
    ) {
      try {
        const dateStr = Array.isArray(currentEntry.entryDate)
          ? currentEntry.entryDate[0]
          : currentEntry.entryDate;

        await dispatch(deleteEntryThunk(dateStr)).unwrap();
        router.push("/entries");
      } catch {
        alert("Failed to delete entry");
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading entry...
      </div>
    );
  if (error || !currentEntry)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error || "Entry not found"}
      </div>
    );

  const entry: DiaryEntry = currentEntry;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{entry.title}</h1>
            <p className="text-gray-600 mt-2">
              {formatDate(entry.createdAt)}
              {entry.updatedAt !== entry.createdAt &&
                ` (Updated: ${formatDate(entry.updatedAt)})`}
            </p>
          </div>

          <div className="flex space-x-3">
            <Link
              href={`/entries/${entry.entryDate}/edit`}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {entry.mood && (
              <div>
                Mood: {entry.mood}{" "}
                {entry.moodIntensity && `(${entry.moodIntensity}/10)`}
              </div>
            )}
            <div>Type: {entry.diaryType.toLowerCase()}</div>
            {entry.location && <div>Location: {entry.location}</div>}
            {entry.isLocked && (
              <div>
                🔒 Locked{" "}
                {entry.passwordHint && `(Hint: ${entry.passwordHint})`}
              </div>
            )}
          </div>

          {entry.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="whitespace-pre-wrap">{entry.contentRaw}</p>

          {entry.contentAI && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">
                AI Enhanced Version
              </h3>
              <p>{entry.contentAI}</p>
            </div>
          )}

          {entry.aiSummary && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-2">AI Summary</h4>
              <p>{entry.aiSummary}</p>
            </div>
          )}

          {entry.mediaUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {entry.mediaUrls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Attachment ${idx + 1}`}
                  className="rounded-lg h-32 w-full object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
