import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  DiaryEntry,
  DiaryFilters,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from "@/types/diary";
import { diaryService } from "../services/diaryService";

// Fetch all entries (with optional filters)
export const fetchEntriesThunk = createAsyncThunk<
  DiaryEntry[],
  DiaryFilters | { year?: string; month?: string }
>("diary/fetchEntries", async (filters, { rejectWithValue }) => {
  try {
    const res = await diaryService.getEntries(filters ?? {});
    return res.entries;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch entries");
  }
});

// Create entry
export const createEntryThunk = createAsyncThunk<DiaryEntry, CreateDiaryEntryInput>(
  "diary/createEntry",
  async (data, { rejectWithValue }) => {
    try {
      return await diaryService.createEntry(data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create entry");
    }
  }
);

// Update entry by ID
export const updateEntryThunk = createAsyncThunk<
  DiaryEntry,
  { id: number; data: UpdateDiaryEntryInput }
>("diary/updateEntry", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await diaryService.updateEntry(id, data);
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to update entry");
  }
});

// Delete entry by ID
export const deleteEntryThunk = createAsyncThunk<number, number>(
  "diary/deleteEntry",
  async (id, { rejectWithValue }) => {
    try {
      await diaryService.deleteEntry(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete entry");
    }
  }
);

// Fetch single entry by ID
export const fetchEntryByIdThunk = createAsyncThunk<DiaryEntry, number>(
  "diary/fetchEntryById",
  async (id, { rejectWithValue }) => {
    try {
      return await diaryService.getEntryById(id);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entry");
    }
  }
);

// ✅ NEW THUNKS FOR DATE-BASED FETCH/UPDATE/DELETE
export const fetchEntryByDateThunk = createAsyncThunk<DiaryEntry | null, string>(
  "diary/fetchEntryByDate",
  async (entryDate, { rejectWithValue }) => {
    try {
      const entries = await diaryService.getEntriesByDate(entryDate);
      return entries.length > 0 ? entries[0] : null;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entry by date");
    }
  }
);

export const updateEntryByDateThunk = createAsyncThunk<
  DiaryEntry,
  { entryDate: string; data: UpdateDiaryEntryInput }
>(
  "diary/updateEntryByDate",
  async ({ entryDate, data }, { rejectWithValue }) => {
    try {
      // Assume you will create a date-based update in diaryService
      const entries = await diaryService.getEntriesByDate(entryDate);
      if (!entries.length) throw new Error("No entry found for this date");
      const entryId = entries[0].id;
      return await diaryService.updateEntry(entryId, data);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update entry by date");
    }
  }
);

export const deleteEntryByDateThunk = createAsyncThunk<string, string>(
  "diary/deleteEntryByDate",
  async (entryDate, { rejectWithValue }) => {
    try {
      const entries = await diaryService.getEntriesByDate(entryDate);
      if (!entries.length) throw new Error("No entry found for this date");
      await diaryService.deleteEntry(entries[0].id);
      return entryDate;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete entry by date");
    }
  }
);
