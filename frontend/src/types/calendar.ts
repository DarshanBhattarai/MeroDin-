import type { Entry } from './entries';

export type CalendarEvent = {
  date: string;
  count: number;
  entries: Entry[];
  mood?: string;
  hasEntry: boolean;
};

export type CalendarView = 'month' | 'week' | 'day';

export type CalendarFilters = {
  year?: number;
  month?: number;
  mood?: string;
  tags?: string[];
};

export type HeatmapData = {
  date: string;
  count: number;
  intensity: number; // 0-5 scale for heatmap colors
  mood?: string;
};

export type CalendarStats = {
  totalEntries: number;
  streak: number;
  longestStreak: number;
  mostProductiveDay: string;
  entriesByMonth: Array<{ month: string; count: number }>;
};