'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { diaryService } from '@/features/entities/services/diaryService';
import { DiaryEntryForm } from '@/features/entities/components/DiaryEntryForm';
import type { DiaryEntry } from '@/types/diary';

export default function CalendarDatePage() {
  const params = useParams();
  const router = useRouter();
  const dateParam = params.date;

  // Ensure date is string
  const date = typeof dateParam === 'string' ? dateParam : dateParam?.[0];

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch entry for this date
  useEffect(() => {
    if (!date) return;

    const fetchEntry = async () => {
      setLoading(true);
      try {
        const entries = await diaryService.getEntriesByDate(date);
        setEntry(entries.length ? entries[0] : null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch entry');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [date]);

  const handleCreate = () => setShowForm(true);
  const handleCancel = () => setShowForm(false);

  const handleFormSubmit = async (data: any) => {
    try {
      const newEntry = await diaryService.createEntry({ ...data, entryDate: date });
      setEntry(newEntry);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create entry');
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await diaryService.deleteEntryByDate(entry.entryDate);
      setEntry(null);
      router.push('/calendar');
    } catch (err) {
      console.error(err);
      setError('Failed to delete entry');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (showForm)
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleCancel}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            ← Back
          </button>

          <DiaryEntryForm
            initialData={{ entryDate: date }}
            onSubmit={handleFormSubmit}
            submitText={`Create Entry for ${formatDate(date!)}`}
            showDateInfo={true}
          />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push('/calendar')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          ← Back to Calendar
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">{formatDate(date!)}</h1>

        {entry ? (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold">{entry.title}</h2>
            <p className="whitespace-pre-wrap">{entry.contentRaw}</p>

            {entry.contentAI && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold mb-2">AI Enhanced Version</h3>
                <p>{entry.contentAI}</p>
              </div>
            )}

            {entry.aiSummary && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">AI Summary</h4>
                <p>{entry.aiSummary}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              {entry.mood && <div>Mood: {entry.mood} {entry.moodIntensity && `(${entry.moodIntensity}/10)`}</div>}
              <div>Type: {entry.diaryType.toLowerCase()}</div>
              {entry.location && <div>Location: {entry.location}</div>}
              {entry.isLocked && <div>🔒 Locked {entry.passwordHint && `(Hint: ${entry.passwordHint})`}</div>}
            </div>

            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {entry.mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {entry.mediaUrls.map((url, idx) => (
                  <img key={idx} src={url} alt={`Attachment ${idx + 1}`} className="rounded-lg h-32 w-full object-cover" />
                ))}
              </div>
            )}

            <div className="flex space-x-2 mt-4">
              <button onClick={handleCreate} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Edit
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No entry for this date.</p>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
