'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks"; // typed useDispatch hook
import { createEntryThunk } from "@/features/entities/redux/diaryThunks";
import { CreateDiaryEntryInput, UpdateDiaryEntryInput } from "@/types/diary";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";
import { DiaryEntryForm } from "@/features/entities/components/DiaryEntryForm";

export default function CreateEntryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    data: CreateDiaryEntryInput | UpdateDiaryEntryInput
  ) => {
    setLoading(true);
    setError(null);

    try {
      const resultAction = await dispatch(createEntryThunk(data as CreateDiaryEntryInput));
      
      if (createEntryThunk.fulfilled.match(resultAction)) {
        router.push("/pages/entries");
      } else {
        // Handle rejected action
        setError(resultAction.payload as string || 'Failed to create entry');
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Diary Entry
            </h1>
            <p className="text-gray-600 mt-2">
              Capture your thoughts and feelings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <DiaryEntryForm
              onSubmit={handleSubmit}
              submitText={loading ? "Creating..." : "Create Entry"}
            />
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
