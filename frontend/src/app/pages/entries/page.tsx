"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  fetchEntryByDateThunk,
  updateEntryThunk,
} from "@/features/entities/redux/diaryThunks";
import { DiaryEntryForm } from "@/features/entities/components/DiaryEntryForm";
import { UpdateDiaryEntryInput } from "@/types/diary";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";

export default function EditEntryPage() {
  const { date: dateParam } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { currentEntry, loading, error } = useAppSelector(
    (state) => state.diary
  );

  useEffect(() => {
    if (dateParam) {
      // Ensure it's a string
      const dateStr = Array.isArray(dateParam) ? dateParam[0] : dateParam;
      dispatch(fetchEntryByDateThunk(dateStr));
    }
  }, [dispatch, dateParam]);

  const handleSubmit = async (data: UpdateDiaryEntryInput) => {
    if (!currentEntry) return;

    try {
      await dispatch(updateEntryThunk({ id: currentEntry.id, data })).unwrap();
      router.push(`/entries/${currentEntry.entryDate}`);
    } catch (err) {
      console.error("Failed to update entry:", err);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div>Loading entry...</div>
      </DashboardLayout>
    );
  if (error || !currentEntry)
    return (
      <DashboardLayout>
        <div>{error || "Entry not found"}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Edit Diary Entry</h1>
          <DiaryEntryForm
            initialData={currentEntry}
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Update Entry"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
