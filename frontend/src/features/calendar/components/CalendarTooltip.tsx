'use client';

import type { DiaryEntry } from '../../../types/calendar';
import { CalendarService } from '../services/calendarService';

type CalendarTooltipProps = {
  diaryEntry: DiaryEntry;
  position: { x: number; y: number };
  isVisible: boolean;
};

export function CalendarTooltip({ diaryEntry, position, isVisible }: CalendarTooltipProps) {
  if (!isVisible || !position) return null;

  const previewText = CalendarService.generatePreview(diaryEntry.contentRaw, 120);
  const moodColor = CalendarService.getMoodColor(diaryEntry.mood);

  return (
    <div
      className="fixed z-50 w-64 bg-white border border-gray-200 rounded-lg shadow-xl transition-opacity duration-200"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translateX(-50%) translateY(-100%)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Tooltip content */}
      <div className="p-3">
        {/* Header with title and mood */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
            {diaryEntry.title}
          </h3>
          {diaryEntry.mood && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${moodColor.replace('bg-', 'text-').replace('border-', 'border-')}`}>
              {diaryEntry.mood}
            </span>
          )}
        </div>

        {/* Preview text */}
        <p className="text-gray-600 text-xs mb-3 line-clamp-3">
          {previewText}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(diaryEntry.entryDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span>
            {new Date(diaryEntry.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Tags */}
        {diaryEntry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {diaryEntry.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {diaryEntry.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-gray-400 text-xs">
                +{diaryEntry.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Diary type badge */}
        {diaryEntry.diaryType !== 'NORMAL' && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {diaryEntry.diaryType.toLowerCase().replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Tooltip arrow */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45"
        style={{ bottom: '-6px' }}
      />
    </div>
  );
}