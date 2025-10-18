'use client';

import { useState, useEffect } from 'react';
import { CalendarService } from '../services/calendarService';
import type { CalendarDay } from '@/types/calendar';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const diaryEntries = await CalendarService.getMonthData(year, month);
      const days = CalendarService.generateCalendarDays(year, month, diaryEntries);
      setCalendarDays(days);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const refreshCalendar = async () => {
    await fetchCalendarData();
  };

  return {
    currentDate,
    calendarDays,
    loading,
    error,
    navigateMonth,
    goToToday,
    setCurrentDate,
    refreshCalendar,
  };
}