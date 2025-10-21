import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  DiaryEntry,
  DiaryFilters,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from "@/types/diary";
import { diaryService, decryptEntry, decryptEntries } from "../services/diaryService";

// -----------------
// Basic CRUD Thunks
// -----------------

export const fetchEntriesThunk = createAsyncThunk<DiaryEntry[], DiaryFilters>(
  "diary/fetchEntries",
  async (filters, { rejectWithValue }) => {
    try {
      const res = await diaryService.getEntries(filters ?? {});
      return decryptEntries(res.entries);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entries");
    }
  }
);

export const createEntryThunk = createAsyncThunk<DiaryEntry, CreateDiaryEntryInput>(
  "diary/createEntry",
  async (data, { rejectWithValue }) => {
    try {
      const entry = await diaryService.createEntry(data);
      return decryptEntry(entry);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create entry");
    }
  }
);

export const updateEntryThunk = createAsyncThunk<
  DiaryEntry,
  { id: number; data: UpdateDiaryEntryInput }
>(
  "diary/updateEntry",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const entry = await diaryService.updateEntry(id, data);
      return decryptEntry(entry);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update entry");
    }
  }
);

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

export const fetchEntryByIdThunk = createAsyncThunk<DiaryEntry, number>(
  "diary/fetchEntryById",
  async (id, { rejectWithValue }) => {
    try {
      const entry = await diaryService.getEntryById(id);
      return decryptEntry(entry);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entry");
    }
  }
);

// -------------------------
// Date / Month / Range Thunks
// -------------------------

export const fetchEntryByDateThunk = createAsyncThunk<DiaryEntry | null, string>(
  "diary/fetchEntryByDate",
  async (entryDate, { rejectWithValue }) => {
    try {
      const entries = await diaryService.getEntriesByDate(entryDate);
      return entries.length > 0 ? decryptEntry(entries[0]) : null;
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
      const entries = await diaryService.getEntriesByDate(entryDate);
      if (!entries.length) throw new Error("No entry found for this date");
      const updated = await diaryService.updateEntry(entries[0].id, data);
      return decryptEntry(updated);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update entry by date");
    }
  }
);

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

export const fetchEntriesByMonthThunk = createAsyncThunk<DiaryEntry[], string>(
  "diary/fetchEntriesByMonth",
  async (month, { rejectWithValue }) => {
    try {
      const entries = await diaryService.getEntriesByMonth(month);
      return decryptEntries(entries);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entries by month");
    }
  }
);

export const fetchEntriesByDateRangeThunk = createAsyncThunk<
  DiaryEntry[],
  { startDate: string; endDate: string }
>(
  "diary/fetchEntriesByDateRange",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const entries = await diaryService.getEntriesByDateRange(startDate, endDate);
      return decryptEntries(entries);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch entries by date range");
    }
  }
);
