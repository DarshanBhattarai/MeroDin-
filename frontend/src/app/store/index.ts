// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import diaryReducer, { DiaryState }  from '@/features/entities/redux/diarySlice';
import diaryAnalyticsReducer from '@/features/entities/redux/diaryAnalyticsSlice';

export const store = configureStore({
  reducer: {
    diary: diaryReducer,
    diaryAnalytics: diaryAnalyticsReducer,
  },
});

export type RootState = {
  diary: DiaryState; // ✅ now it works
  diaryAnalytics: ReturnType<typeof diaryAnalyticsReducer>;
};

export type AppDispatch = typeof store.dispatch;
