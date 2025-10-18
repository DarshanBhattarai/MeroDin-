'use client';

import Link from 'next/link';
import { DiaryPreview } from './DiaryPreview';
import type { CalendarDay } from '../../../types/calendar';

type CalendarDayProps = {
  day: CalendarDay;
  onMouseEnter?: (event: React.MouseEvent, diaryEntry: any) => void;
  onMouseMove?: (event: React.MouseEvent, diaryEntry: any) => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
};

export function CalendarDayComponent({ 
  day, 
  onMouseEnter, 
  onMouseMove, 
  onMouseLeave, 
  onClick 
}: CalendarDayProps) {
  const dateString = day.date.toISOString().split('T')[0];
  const isClickable = day.isCurrentMonth;

  const dayClasses = `
    min-h-[120px] p-2 transition-all duration-200
    ${day.isCurrentMonth 
      ? 'bg-white hover:bg-gray-50 cursor-pointer' 
      : 'bg-gray-50 text-gray-400 cursor-default'
    }
    ${day.isToday 
      ? 'ring-2 ring-blue-500 ring-inset bg-blue-50' 
      : ''
    }
    relative
  `;

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (day.diaryEntry && onMouseEnter) {
      onMouseEnter(event, day.diaryEntry);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (day.diaryEntry && onMouseMove) {
      onMouseMove(event, day.diaryEntry);
    }
  };

  const handleClick = () => {
    if (onClick && isClickable) {
      onClick();
    }
  };

  return (
    <div
      className={dayClasses}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    >
      {/* Date number */}
      <div className="flex justify-between items-start mb-1">
        <span className={`text-sm font-medium ${
          day.isToday 
            ? 'text-blue-600' 
            : day.isCurrentMonth 
              ? 'text-gray-900' 
              : 'text-gray-400'
        }`}>
          {day.date.getDate()}
        </span>
        
        {/* Add entry button for empty days in current month */}
        {!day.diaryEntry && day.isCurrentMonth && (
          <Link
            href={`/entries/create?date=${dateString}`}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded text-xs transition-colors duration-200"
            aria-label={`Add diary entry for ${dateString}`}
            onClick={(e) => e.stopPropagation()}
          >
            +
          </Link>
        )}
      </div>

      {/* Diary preview */}
      {day.diaryEntry && day.isCurrentMonth && (
        <Link 
          href={`/entries/${day.diaryEntry.id}`}
          className="block"
          onClick={(e) => e.stopPropagation()}
        >
          <DiaryPreview 
            diaryEntry={day.diaryEntry} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          />
        </Link>
      )}

      {/* Today indicator dot */}
      {day.isToday && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
      )}
    </div>
  );
}