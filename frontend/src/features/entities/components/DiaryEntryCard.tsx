import React from 'react';
import Link from 'next/link';
import { DiaryEntry } from '@/types/diary';

type DiaryEntryCardProps = {
  entry: DiaryEntry;
  onDelete?: (id: number) => void;
};

export const DiaryEntryCard: React.FC<DiaryEntryCardProps> = ({ entry, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDiaryTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      NORMAL: 'bg-blue-100 text-blue-800',
      SECRET: 'bg-red-100 text-red-800',
      MEMORY: 'bg-purple-100 text-purple-800',
      QUICK_NOTE: 'bg-green-100 text-green-800',
    };
    return type ? colors[type] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 truncate">
          {entry.title || "Untitled"}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDiaryTypeColor(entry.diaryType)}`}>
          {entry.diaryType?.replace('_', ' ') || "N/A"}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {entry.contentRaw || "-"}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {entry.mood && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            😊 {entry.mood}{entry.moodIntensity ? ` (${entry.moodIntensity}/10)` : ""}
          </span>
        )}
        {entry.tags?.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            #{tag}
          </span>
        ))}
      </div>

      {entry.location && (
        <p className="text-sm text-gray-500 mb-3">
          📍 {entry.location}
        </p>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {formatDate(entry.createdAt)}
        </span>

        <div className="flex space-x-2">
          {entry.id && (
            <>
              <Link
                href={`/entries/${entry.id}`}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                View
              </Link>
              <Link
                href={`/entries/${entry.id}/edit`}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Edit
              </Link>
            </>
          )}
          {onDelete && entry.id && (
            <button
              onClick={() => onDelete(entry.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {entry.isLocked && (
        <div className="mt-3 flex items-center text-sm text-yellow-600">
          🔒 Locked {entry.passwordHint ? `- Hint: ${entry.passwordHint}` : ""}
        </div>
      )}
    </div>
  );
};
