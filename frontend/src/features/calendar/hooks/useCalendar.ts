"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchEntriesThunk } from "@/features/entities/redux/diaryThunks";
import type { CalendarDay } from "@/types/calendar";

export function useCalendar() {
  const dispatch = useAppDispatch();
  const { entries, loading, error } = useAppSelector((state) => state.diary);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    // Fetch diary entries for the month
  dispatch(fetchEntriesThunk({ year: String(year), month: String(month) }));
  }, [dispatch, year, month]);

  useEffect(() => {
    // Map diary entries to calendar days
    const days: CalendarDay[] = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const diaryEntry = entries.find(
        (e) => new Date(e.entryDate).toDateString() === date.toDateString()
      );
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === new Date().toDateString(),
        diaryEntry,
      });
    }

    setCalendarDays(days);
  }, [entries, year, month]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const refreshCalendar = () => {
    dispatch(fetchEntriesThunk({ year: String(year), month: String(month) }));
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
