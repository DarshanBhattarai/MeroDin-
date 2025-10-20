// src/features/diary/redux/diaryThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  DiaryEntry,
  DiaryFilters,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
} from "@/types/diary";
import { diaryService } from "../services/diaryService";

export const fetchEntriesThunk = createAsyncThunk<
  DiaryEntry[],
  DiaryFilters | undefined
>("diary/fetchEntries", async (filters, { rejectWithValue }) => {
  try {
    const res = await diaryService.getEntries(filters ?? {});
    return res.entries;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch entries");
  }
});

export const createEntryThunk = createAsyncThunk<
  DiaryEntry,
  CreateDiaryEntryInput
>("diary/createEntry", async (data, { rejectWithValue }) => {
  try {
    return await diaryService.createEntry(data);
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to create entry");
  }
});

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
