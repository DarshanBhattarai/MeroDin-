// src/features/entities/services/diaryService.ts
import {
  DiaryEntry,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  DiaryStats,
  DiaryFilters,
} from "@/types/diary";
import { securityUtils } from "@/utils/securityUtils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RequestOptions = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

const request = async (endpoint: string, options: RequestOptions = {}) => {
  const config: RequestInit = {
    method: options.method || "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...(options.body && { body: options.body }),
  };

  const response = await fetch(`${API_BASE_URL}/diary${endpoint}`, config);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `API error: ${response.status} ${response.statusText} - ${text}`
    );
  }

  const data = await response.json();
  return data;
};

// ----------------------
// 🔐 Decryption Helpers
// ----------------------

// Decrypt a single diary entry
// 🔐 Robust helper to decrypt a single diary entry safely
export const decryptEntry = (entry: Partial<DiaryEntry>): DiaryEntry => ({
  id: entry.id ?? 0, // fallback to 0 if undefined
  title: entry.title ? securityUtils.decrypt(entry.title) : "",
  contentRaw: entry.contentRaw ? securityUtils.decrypt(entry.contentRaw) : "",
  contentAI: entry.contentAI
    ? securityUtils.decrypt(entry.contentAI)
    : undefined,
  aiSummary: entry.aiSummary
    ? securityUtils.decrypt(entry.aiSummary)
    : undefined,
  mood: entry.mood ?? undefined,
  moodIntensity: entry.moodIntensity ?? undefined,
  diaryType: entry.diaryType ?? "NORMAL",
  tags: entry.tags ?? [],
  mediaUrls: entry.mediaUrls ?? [],
  location: entry.location ?? undefined,
  isLocked: entry.isLocked ?? false,
  passwordHint: entry.passwordHint
    ? securityUtils.decrypt(entry.passwordHint)
    : undefined,
  aiKeywords: entry.aiKeywords ?? [],
  entryDate: entry.entryDate ?? "",
  createdAt: entry.createdAt ?? new Date().toISOString(),
  updatedAt: entry.updatedAt ?? new Date().toISOString(),
});

// Decrypt multiple entries safely
export const decryptEntries = (entries: Partial<DiaryEntry>[] = []): DiaryEntry[] =>
  entries.map(decryptEntry);

// ----------------------
// 📄 CRUD & Analytics
// ----------------------

export const createEntry = async (
  data: CreateDiaryEntryInput
): Promise<DiaryEntry> => {
  const response = await request("/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return decryptEntry(response.entry || response);
};

export const getEntries = async (filters: DiaryFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      params.append(key, value.toString());
  });

  const response = await request(`/entries?${params.toString()}`);
  const entries: Partial<DiaryEntry>[] = response.entries || response || [];
  return {
    entries: decryptEntries(entries),
    pagination: response.pagination || null,
  };
};

export const getMyEntries = async (
  filters: { diaryType?: string; mood?: string } = {}
): Promise<DiaryEntry[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await request(`/entries/my?${params.toString()}`);
  return decryptEntries(response.entries || []);
};

export const getEntryById = async (id: number): Promise<DiaryEntry> => {
  const response = await request(`/entries/${id}`);
  return decryptEntry(response.entry || response);
};

export const updateEntry = async (
  id: number,
  data: UpdateDiaryEntryInput
): Promise<DiaryEntry> => {
  const response = await request(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return decryptEntry(response.entry || response);
};

export const deleteEntry = async (id: number): Promise<{ message: string }> => {
  return request(`/entries/${id}`, { method: "DELETE" });
};

export const getAnalytics = async (): Promise<DiaryStats> => {
  const response = await request("/entries/analytics");
  return response.stats || response;
};

export const searchEntries = async (
  query: string,
  filters: { diaryType?: string; mood?: string } = {}
) => {
  const params = new URLSearchParams({ query });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await request(`/entries/search?${params.toString()}`);
  return {
    entries: decryptEntries(response.entries || []),
    pagination: response.pagination,
  };
};

// ----------------------
// 📅 Calendar / Date-based
// ----------------------

export const getEntriesByDate = async (date: string): Promise<DiaryEntry[]> => {
  try {
    const { entries } = await getEntries({ date });
    return entries;
  } catch (error) {
    console.error("Error fetching entries by date:", error);
    return [];
  }
};

export const getEntriesByMonth = async (
  month: string
): Promise<DiaryEntry[]> => {
  try {
    const { entries } = await getEntries({ month });
    return entries;
  } catch (error) {
    console.error("Error fetching entries by month:", error);
    return [];
  }
};

export const deleteEntryByDate = async (
  entryDate: string
): Promise<{ message: string }> => {
  return request(`/entries/date/${entryDate}`, { method: "DELETE" });
};

export const getEntriesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<DiaryEntry[]> => {
  try {
    const { entries } = await getEntries({ startDate, endDate });
    return entries;
  } catch (error) {
    console.error("Error fetching entries by date range:", error);
    return [];
  }
};

// ----------------------
// 🔹 Export Diary Service
// ----------------------

export const diaryService = {
  createEntry,
  getEntries,
  getMyEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  deleteEntryByDate,
  getAnalytics,
  searchEntries,
  getEntriesByDate,
  getEntriesByMonth,
  getEntriesByDateRange,
};
