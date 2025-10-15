'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiaryEntry } from '@/features/entities/hooks/useDiary';

export default function DiaryEntryPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = parseInt(params.id as string);
  
  const { entry, loading, error, deleteEntry } = useDiaryEntry(entryId);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        await deleteEntry();
        router.push('/entries');
      } catch (err) {
        alert('Failed to delete entry');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading entry...</div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Entry not found'}
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{entry.title}</h1>
            <p className="text-gray-600 mt-2">
              {formatDate(entry.createdAt)}
              {entry.updatedAt !== entry.createdAt && ` (Updated: ${formatDate(entry.updatedAt)})`}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/entries/${entry.id}/edit`}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Entry Metadata */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {entry.mood && (
              <div className="flex items-center">
                <span className="font-medium">Mood:</span>
                <span className="ml-2">{entry.mood} {entry.moodIntensity && `(${entry.moodIntensity}/10)`}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="font-medium">Type:</span>
              <span className="ml-2 capitalize">{entry.diaryType.toLowerCase().replace('_', ' ')}</span>
            </div>

            {entry.location && (
              <div className="flex items-center">
                <span className="font-medium">Location:</span>
                <span className="ml-2">{entry.location}</span>
              </div>
            )}

            {entry.isLocked && (
              <div className="flex items-center text-yellow-600">
                <span>🔒 Locked</span>
                {entry.passwordHint && (
                  <span className="ml-2">Hint: {entry.passwordHint}</span>
                )}
              </div>
            )}
          </div>

          {entry.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {entry.contentRaw}
            </p>
          </div>

          {/* AI Content (if available) */}
          {entry.contentAI && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Enhanced Version</h3>
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {entry.contentAI}
              </p>
            </div>
          )}

          {/* AI Summary (if available) */}
          {entry.aiSummary && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">AI Summary</h4>
              <p className="text-blue-800">{entry.aiSummary}</p>
            </div>
          )}

          {/* Media (if available) */}
          {entry.mediaUrls.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Media</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {entry.mediaUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="rounded-lg object-cover h-32 w-full"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}