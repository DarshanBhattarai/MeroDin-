'use client';

import { CalendarDayComponent } from './CalendarDay';
import { CalendarTooltip } from './CalendarTooltip';
import { useDiaryPreview } from '../hooks/useDiaryPreview';
import type { CalendarDay } from '../../../types/calendar';

type CalendarGridProps = {
  calendarDays: CalendarDay[];
  onDateSelect?: (date: Date) => void;
  onEntrySelect?: (entry: any) => void;
};

export function CalendarGrid({ calendarDays, onDateSelect, onEntrySelect }: CalendarGridProps) {
  const { 
    previewPosition, 
    previewData, 
    isVisible, 
    showPreview, 
    hidePreview,
    updatePreviewPosition 
  } = useDiaryPreview();

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = (day: CalendarDay) => {
    if (onDateSelect && day.isCurrentMonth) {
      onDateSelect(day.date);
    }
    if (day.diaryEntry && onEntrySelect) {
      onEntrySelect(day.diaryEntry);
    }
  };

  const handleDayMouseEnter = (event: React.MouseEvent, diaryEntry: any) => {
    showPreview(event, diaryEntry);
  };

  const handleDayMouseMove = (event: React.MouseEvent, diaryEntry: any) => {
    if (isVisible && previewData?.id === diaryEntry.id) {
      updatePreviewPosition(event);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekdays.map(day => (
          <div
            key={day}
            className="p-3 text-sm font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className="border-r border-b border-gray-200 last:border-r-0"
          >
            <CalendarDayComponent
              day={day}
              onMouseEnter={handleDayMouseEnter}
              onMouseMove={(e) => day.diaryEntry && handleDayMouseMove(e, day.diaryEntry)}
              onMouseLeave={hidePreview}
            />
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {previewData && (
        <CalendarTooltip
          diaryEntry={previewData}
          position={previewPosition!}
          isVisible={isVisible}
        />
      )}
    </div>
  );
}