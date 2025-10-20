// src/features/calendar/components/DiaryCalendar.tsx
'use client';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchEntriesThunk } from '@/features/entities/redux/diaryThunks';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function DiaryCalendar() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { entries, loading, error } = useAppSelector((state) => state.diary);

  useEffect(() => {
    dispatch(fetchEntriesThunk({})); // fetch all entries, pass filters if needed
  }, [dispatch]);

  const handleDateClick = (date: Date) => {
    const dayEntries = entries.filter(
      (entry) => new Date(entry.entryDate).toDateString() === date.toDateString()
    );

    if (dayEntries.length > 0) {
      router.push(`/entries/${dayEntries[0].id}`); // navigate to first entry for that day
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEntries = entries.filter(
        (entry) => new Date(entry.entryDate).toDateString() === date.toDateString()
      );
      return dayEntries.length > 0 ? (
        <div className="bg-blue-200 rounded-full w-2 h-2 mt-1 mx-auto" />
      ) : null;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {loading && <div>Loading diary entries...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <Calendar
        onClickDay={handleDateClick}
        tileContent={tileContent}
      />
    </div>
  );
}
