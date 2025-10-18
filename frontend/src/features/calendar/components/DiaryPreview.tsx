'use client';

import type { DiaryEntry } from '../../../types/calendar';
import { CalendarService } from '../services/calendarService';

type DiaryPreviewProps = {
  diaryEntry: DiaryEntry;
  className?: string;
};

export function DiaryPreview({ diaryEntry, className = '' }: DiaryPreviewProps) {
  const moodColor = CalendarService.getMoodColor(diaryEntry.mood);
  const previewText = CalendarService.generatePreview(diaryEntry.contentRaw);

  return (
    <div className={`p-2 rounded-lg border-2 ${moodColor} shadow-xs hover:shadow-sm transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-sm text-gray-900 truncate">
          {diaryEntry.title}
        </h4>
        <div className="flex items-center space-x-1 ml-1">
          {diaryEntry.diaryType !== 'NORMAL' && (
            <span className="text-xs px-1 py-0.5 bg-gray-100 text-gray-600 rounded">
              {diaryEntry.diaryType.toLowerCase()}
            </span>
          )}
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {new Date(diaryEntry.entryDate).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
        {previewText}
      </p>
      
      {diaryEntry.tags.length > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {diaryEntry.tags.slice(0, 2).map(tag => (
            <span 
              key={tag}
              className="text-xs px-1 py-0.5 bg-blue-50 text-blue-600 rounded"
            >
              #{tag}
            </span>
          ))}
          {diaryEntry.tags.length > 2 && (
            <span className="text-xs text-gray-400">
              +{diaryEntry.tags.length - 2}
            </span>
          )}
        </div>
      )}
      
      {diaryEntry.isLocked && (
        <div className="flex items-center justify-end mt-1">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}