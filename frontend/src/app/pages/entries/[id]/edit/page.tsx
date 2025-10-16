"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { DiaryEntryForm } from "@/features/entities/components/DiaryEntryForm";
import { useDiaryEntry } from "@/features/entities/hooks/useDiary";
import { UpdateDiaryEntryInput } from "@/types/diary";
import { DashboardLayout } from "@/features/dashboard/layouts/DashboardLayout";

export default function EditEntryPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = parseInt(params.id as string);
  
  const { entry, loading, error, updateEntry } = useDiaryEntry(entryId);

  const handleSubmit = async (data: UpdateDiaryEntryInput) => {
    try {
      await updateEntry(data);
      router.push(`/pages/entries/${entryId}`);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !entry) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || 'Entry not found'}
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Diary Entry</h1>
            <p className="text-gray-600 mt-2">Update your thoughts and feelings</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <DiaryEntryForm
              onSubmit={handleSubmit}
              loading={loading}
              submitText="Update Entry"
              initialData={entry}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}