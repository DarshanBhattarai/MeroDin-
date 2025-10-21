import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiaryEntry } from '@/types/diary';
import {
  fetchEntriesThunk,
  fetchEntryByIdThunk,
  createEntryThunk,
  updateEntryThunk,
  deleteEntryThunk,
  fetchEntryByDateThunk,
  updateEntryByDateThunk,
  deleteEntryByDateThunk,
} from '@/features/entities/redux/diaryThunks';
import { decryptEntry, decryptEntries } from '@/features/entities/services/diaryService';

export type DiaryState = {
  entries: DiaryEntry[];
  currentEntry?: DiaryEntry;
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
      state.entries = decryptEntries(action.payload);
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: DiaryState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: DiaryState, action: any) => {
      state.loading = false;
      state.error = action.payload || action.error?.message || 'Operation failed';
    };

    // Fetch all entries
    builder.addCase(fetchEntriesThunk.pending, handlePending)
      .addCase(fetchEntriesThunk.fulfilled, (state, action: PayloadAction<DiaryEntry[]>) => {
        state.entries = decryptEntries(action.payload);
        state.loading = false;
      })
      .addCase(fetchEntriesThunk.rejected, handleRejected);

    // Fetch entry by ID
    builder.addCase(fetchEntryByIdThunk.pending, handlePending)
      .addCase(fetchEntryByIdThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
        state.currentEntry = decryptEntry(action.payload);
        state.loading = false;
      })
      .addCase(fetchEntryByIdThunk.rejected, handleRejected);

    // Create entry
    builder.addCase(createEntryThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
      state.entries.unshift(decryptEntry(action.payload));
    });

    // Update entry by ID
    builder.addCase(updateEntryThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
      const updated = decryptEntry(action.payload);
      const idx = state.entries.findIndex(e => e.id === updated.id);
      if (idx !== -1) state.entries[idx] = updated;
      if (state.currentEntry?.id === updated.id) state.currentEntry = updated;
    });

    // Delete entry by ID
    builder.addCase(deleteEntryThunk.fulfilled, (state, action: PayloadAction<number>) => {
      state.entries = state.entries.filter(e => e.id !== action.payload);
      if (state.currentEntry?.id === action.payload) state.currentEntry = undefined;
    });

    // Date-based fetch/update/delete
    builder.addCase(fetchEntryByDateThunk.pending, handlePending)
      .addCase(fetchEntryByDateThunk.fulfilled, (state, action: PayloadAction<DiaryEntry | null>) => {
        state.currentEntry = action.payload ? decryptEntry(action.payload) : undefined;
        state.loading = false;
      })
      .addCase(fetchEntryByDateThunk.rejected, handleRejected);

    builder.addCase(updateEntryByDateThunk.fulfilled, (state, action: PayloadAction<DiaryEntry>) => {
      const updated = decryptEntry(action.payload);
      const idx = state.entries.findIndex(e => e.id === updated.id);
      if (idx !== -1) state.entries[idx] = updated;
      if (state.currentEntry?.id === updated.id) state.currentEntry = updated;
    });

    builder.addCase(deleteEntryByDateThunk.fulfilled, (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(e => e.entryDate !== action.payload);
      if (state.currentEntry?.entryDate === action.payload) state.currentEntry = undefined;
    });
  },
});

export const { clearDiaryError, setEntries } = diarySlice.actions;
export default diarySlice.reducer;
