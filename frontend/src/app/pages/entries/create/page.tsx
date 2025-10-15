'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DiaryEntryForm } from '@/features/entities/components/DiaryEntryForm';
import { useDiary } from '@/features/entities/hooks/useDiary';
import { CreateDiaryEntryInput, UpdateDiaryEntryInput } from '@/types/diary';

export default function CreateEntryPage() {
  const router = useRouter();
  const { createEntry, loading } = useDiary();

  const handleSubmit = async (data: CreateDiaryEntryInput | UpdateDiaryEntryInput) => {
    try {
      // Type assertion since we know it's CreateDiaryEntryInput for creation
      await createEntry(data as CreateDiaryEntryInput);
      router.push('/entries');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Diary Entry</h1>
          <p className="text-gray-600 mt-2">Capture your thoughts and feelings</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <DiaryEntryForm
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create Entry"
          />
        </div>
      </div>
    </div>
  );
}