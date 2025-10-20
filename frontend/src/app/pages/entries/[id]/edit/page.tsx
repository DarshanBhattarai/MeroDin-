"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DiaryEntryForm } from "@/features/entities/components/DiaryEntryForm";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  fetchEntryByIdThunk,
  updateEntryThunk,
} from "@/features/entities/redux/diaryThunks";
import { UpdateDiaryEntryInput } from "@/types/diary";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";

export default function EditEntryPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const entryId = parseInt(params.id as string);

  // ✅ Typed selector
  const { currentEntry, loading, error } = useAppSelector(
    (state) => state.diary
  );

  useEffect(() => {
    if (entryId) dispatch(fetchEntryByIdThunk(entryId));
  }, [dispatch, entryId]);

  const handleSubmit = async (data: UpdateDiaryEntryInput) => {
    if (!currentEntry) return;

    try {
      // ✅ Pass id and data separately
      await dispatch(updateEntryThunk({ id: currentEntry.id, data })).unwrap();
      router.push(`/entries/${currentEntry.id}`);
    } catch (err) {
      console.error("Failed to update entry:", err);
    }
  };
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600 text-lg">Loading entry...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !currentEntry) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow-md">
            {error || "Entry not found"}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Diary Entry
            </h1>
            <p className="text-gray-600 mt-2">
              Update your thoughts and feelings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <DiaryEntryForm
              initialData={currentEntry}
              onSubmit={handleSubmit}
              loading={loading}
              submitText="Update Entry"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
