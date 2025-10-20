// src/features/entities/redux/diarySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiaryEntry } from '@/types/diary';
import {
  fetchEntriesThunk,
  fetchEntryByIdThunk,
  createEntryThunk,
  updateEntryThunk,
  deleteEntryThunk,
} from '@/features/entities/redux/diaryThunks';

// ✅ Export DiaryState as a type
export type DiaryState = {
  entries: DiaryEntry[];
  currentEntry?: DiaryEntry; // optional
  loading: boolean;
  error?: string | null;
};

const initialState: DiaryState = {
  entries: [],
  currentEntry: undefined,
  loading: false,
  error: null,
};

const diarySlice = createSlice({
  name: 'diary',
  initialState,
  reducers: {
    clearDiaryError: (state) => {
      state.error = null;
    },
    setEntries: (state, action: PayloadAction<DiaryEntry[]>) => {
      state.entries = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all entries
    builder
      .addCase(fetchEntriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntriesThunk.fulfilled, (state, action: PayloadAction<DiaryEntry[]>) => {
        state.entries = action.payload;
        state.loading = false;
      })
      .addCase(fetchEntriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entries';
      });

    // Fetch single entry by ID
    builder
      .addCase(fetchEntryByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentEntry = undefined;
      })
      .addCase(fetchEntryByIdThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
        state.currentEntry = action.payload;
        state.loading = false;
      })
      .addCase(fetchEntryByIdThunk.rejected, (state, action) => {
        state.currentEntry = undefined;
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entry';
      });

    // Create, update, delete
    builder
      .addCase(createEntryThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
        state.entries.unshift(action.payload);
      })
      .addCase(updateEntryThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
        const idx = state.entries.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.entries[idx] = action.payload;
        if (state.currentEntry?.id === action.payload.id) state.currentEntry = action.payload;
      })
      .addCase(deleteEntryThunk.fulfilled, (state, action: PayloadAction<number>) => {
        state.entries = state.entries.filter((e) => e.id !== action.payload);
        if (state.currentEntry?.id === action.payload) state.currentEntry = undefined;
      });
  },
});

export const { clearDiaryError, setEntries } = diarySlice.actions;
export default diarySlice.reducer;
