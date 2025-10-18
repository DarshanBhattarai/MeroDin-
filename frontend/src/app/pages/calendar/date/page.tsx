'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { diaryService } from '../../../../features/entities/services/diaryService';
import { DiaryEntryForm } from '../../../../features/entities/components/DiaryEntryForm';
import type { DiaryEntry } from '@/types/calendar';

export default function CalendarDatePage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;
  
  const [existingEntry, setExistingEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchEntryForDate = async () => {
      try {
        setLoading(true);
        const entries = await diaryService.getEntriesByDate(date);
        setExistingEntry(entries.length > 0 ? entries[0] : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch diary entry');
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchEntryForDate();
    }
  }, [date]);

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await diaryService.createEntry(data);
      // Refresh the page to show the new entry
      window.location.reload();
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Date View
          </button>
          
          <DiaryEntryForm 
            initialData={{ 
              entryDate: date // This will be automatically used by the form
            }}
            onSubmit={handleFormSubmit}
            submitText={`Create Entry for ${formatDate(date)}`}
            showDateInfo={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/calendar')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Calendar
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {formatDate(date)}
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {existingEntry ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{existingEntry.title}</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/entries/${existingEntry.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/entries/${existingEntry.id}/edit`)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  {existingEntry.contentRaw?.substring(0, 200)}...
                </p>
                {existingEntry.mood && (
                  <div className="text-sm text-gray-600">
                    Mood: <span className="font-medium">{existingEntry.mood}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No entry for this date</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't written anything for {formatDate(date)}. Would you like to create an entry?
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create New Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}