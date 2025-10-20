// src/features/diary/redux/diaryAnalyticsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiaryStats } from '@/types/diary';
import { fetchAnalyticsThunk } from './diaryAnalyticsThunks';

type AnalyticsState = {
  stats: DiaryStats | null;
  loading: boolean;
  error: string | null;
};

const initialState: AnalyticsState = {
  stats: null,
  loading: false,
  error: null,
};

const diaryAnalyticsSlice = createSlice({
  name: 'diaryAnalytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsThunk.fulfilled, (state, action: PayloadAction<DiaryStats>) => {
        state.stats = action.payload;
        state.loading = false;
      })
      .addCase(fetchAnalyticsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch analytics';
      });
  }
});

export const { clearAnalyticsError } = diaryAnalyticsSlice.actions;
export default diaryAnalyticsSlice.reducer;
