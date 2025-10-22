import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  DiaryEntry,
  DiaryFilters,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from "@/types/diary";
import {
  diaryService,
  decryptEntry,
  decryptEntries,
} from "../services/diaryService";

// Fetch all entries
export const fetchEntriesThunk = createAsyncThunk<DiaryEntry[], DiaryFilters>(
  "diary/fetchEntries",
  async (filters, { rejectWithValue }) => {
    try {
      const res = await diaryService.getEntries(filters ?? {});
      // Ensure always array
      const entriesArray = Array.isArray(res?.entries) ? res.entries : [];
      return decryptEntries(entriesArray);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entries");
    }
  }
);

// Create entry
export const createEntryThunk = createAsyncThunk<
  DiaryEntry,
  CreateDiaryEntryInput
>("diary/createEntry", async (data, { rejectWithValue }) => {
  try {
    const entry = await diaryService.createEntry(data);
    return decryptEntry(entry);
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to create entry");
  }
});

// Update entry
export const updateEntryThunk = createAsyncThunk<
  DiaryEntry,
  { id: number; data: UpdateDiaryEntryInput }
>("diary/updateEntry", async ({ id, data }, { rejectWithValue }) => {
  try {
    const entry = await diaryService.updateEntry(id, data);
    return decryptEntry(entry);
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to update entry");
  }
});

// Delete entry
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

// Fetch by date
export const fetchEntryByDateThunk = createAsyncThunk<
  DiaryEntry | null,
  string
>("diary/fetchEntryByDate", async (entryDate, { rejectWithValue }) => {
  try {
    const entries = await diaryService.getEntriesByDate(entryDate);
    return entries.length ? decryptEntry(entries[0]) : null;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch entry by date");
  }
});

// Update by date
export const updateEntryByDateThunk = createAsyncThunk<
  DiaryEntry,
  { entryDate: string; data: UpdateDiaryEntryInput }
>(
  "diary/updateEntryByDate",
  async ({ entryDate, data }, { rejectWithValue }) => {
    try {
      const entries = await diaryService.getEntriesByDate(entryDate);
      if (!entries.length) throw new Error("No entry found for this date");
      const updated = await diaryService.updateEntry(entries[0].id, data);
      return decryptEntry(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update entry by date");
    }
  }
);

// Delete by date
export const deleteEntryByDateThunk = createAsyncThunk<string, string>(
  "diary/deleteEntryByDate",
  async (entryDate, { rejectWithValue }) => {
    try {
      await diaryService.deleteEntryByDate(entryDate);
      return entryDate;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to delete entry by date");
    }
  }
);
