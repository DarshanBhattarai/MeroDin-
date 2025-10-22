import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DiaryEntry } from "@/types/diary";
import {
  fetchEntriesThunk,
  fetchEntryByDateThunk,
  createEntryThunk,
  updateEntryThunk,
  deleteEntryThunk,
  updateEntryByDateThunk,
  deleteEntryByDateThunk,
} from "@/features/entities/redux/diaryThunks";
import {
  decryptEntry,
  decryptEntries,
} from "@/features/entities/services/diaryService";

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
  name: "diary",
  initialState,
  reducers: {
    clearDiaryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: DiaryState) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state: DiaryState, action: any) => {
      state.loading = false;
      state.error =
        action.payload || action.error?.message || "Operation failed";
    };

    // Fetch entries
    builder
      .addCase(fetchEntriesThunk.pending, handlePending)
      .addCase(
        fetchEntriesThunk.fulfilled,
        (state, action: PayloadAction<DiaryEntry[]>) => {
          // ✅ Always enforce array and decrypt safely
          state.entries = Array.isArray(action.payload)
            ? decryptEntries(action.payload)
            : [];
          state.loading = false;
        }
      )
      .addCase(fetchEntriesThunk.rejected, handleRejected);

    // Fetch by date
    builder
      .addCase(fetchEntryByDateThunk.pending, handlePending)
      .addCase(
        fetchEntryByDateThunk.fulfilled,
        (state, action: PayloadAction<DiaryEntry | null>) => {
          state.currentEntry = action.payload || undefined;
          state.loading = false;
        }
      )
      .addCase(fetchEntryByDateThunk.rejected, handleRejected);

    // Create entry
    builder.addCase(
      createEntryThunk.fulfilled,
      (state, action: PayloadAction<DiaryEntry>) => {
        state.entries.unshift(action.payload);
      }
    );

    // Update entry
    builder.addCase(
      updateEntryThunk.fulfilled,
      (state, action: PayloadAction<DiaryEntry>) => {
        const idx = state.entries.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.entries[idx] = action.payload;
        if (state.currentEntry?.id === action.payload.id)
          state.currentEntry = action.payload;
      }
    );

    // Delete entry
    builder.addCase(
      deleteEntryThunk.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.entries = state.entries.filter((e) => e.id !== action.payload);
        if (state.currentEntry?.id === action.payload)
          state.currentEntry = undefined;
      }
    );

    // Update / Delete by date
    builder.addCase(
      updateEntryByDateThunk.fulfilled,
      (state, action: PayloadAction<DiaryEntry>) => {
        const idx = state.entries.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.entries[idx] = action.payload;
        if (state.currentEntry?.id === action.payload.id)
          state.currentEntry = action.payload;
      }
    );

    builder.addCase(
      deleteEntryByDateThunk.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.entries = state.entries.filter(
          (e) => e.entryDate !== action.payload
        );
        if (state.currentEntry?.entryDate === action.payload)
          state.currentEntry = undefined;
      }
    );
  },
});

export const { clearDiaryError } = diarySlice.actions;
export default diarySlice.reducer;
