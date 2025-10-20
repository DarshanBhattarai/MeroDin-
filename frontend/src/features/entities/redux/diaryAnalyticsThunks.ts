// src/features/entities/redux/diaryAnalyticsThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { diaryService } from '../services/diaryService';
import { DiaryStats } from '@/types/diary';

export const fetchAnalyticsThunk = createAsyncThunk<DiaryStats, void>(
  'diaryAnalytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await diaryService.getAnalytics();
      return stats;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch analytics');
    }
  }
);
