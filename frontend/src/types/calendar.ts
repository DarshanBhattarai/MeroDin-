// Reuse your existing types from src/types/diary.ts
import type { DiaryEntry as ExistingDiaryEntry } from '@/types/diary';

// Extend or use directly your existing types
export type DiaryEntry = ExistingDiaryEntry;

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  diaryEntry?: DiaryEntry;
};

export type MonthData = {
  year: number;
  month: number;
  days: CalendarDay[];
};