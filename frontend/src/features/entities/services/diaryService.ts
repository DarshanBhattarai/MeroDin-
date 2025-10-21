import {
  DiaryEntry,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  DiaryStats,
  DiaryFilters,
} from "@/types/diary";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RequestOptions = {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
};

const request = async (endpoint: string, options: RequestOptions = {}) => {
  const config = {
    method: options.method || "GET",
    credentials: "include" as RequestCredentials, // send cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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

// Existing functions
export const createEntry = async (
  data: CreateDiaryEntryInput
): Promise<DiaryEntry> => {
  return request("/entries", { method: "POST", body: JSON.stringify(data) });
};

export const getEntries = async (filters: DiaryFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const response = await request(`/entries?${params.toString()}`);
  return {
    entries: response.entries || response || [],
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
  return response.entries || []; // Safe fallback
};

export const getEntryById = async (id: number): Promise<DiaryEntry> => {
  const response = await request(`/entries/${id}`);
  return response.entry || response; // fallback if API wraps data differently
};

export const updateEntry = async (
  id: number,
  data: UpdateDiaryEntryInput
): Promise<DiaryEntry> => {
  const response = await request(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.entry || response;
};

export const deleteEntry = async (id: number): Promise<{ message: string }> => {
  const response = await request(`/entries/${id}`, { method: "DELETE" });
  return response;
};

export const getAnalytics = async (): Promise<DiaryStats> => {
  const response = await request("/entries/analytics");
  return response.stats || response; // fallback
};

export const searchEntries = async (
  query: string,
  filters: { diaryType?: string; mood?: string } = {}
): Promise<{ entries: DiaryEntry[]; pagination?: any }> => {
  const params = new URLSearchParams({ query });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const response = await request(`/entries/search?${params.toString()}`);
  return { entries: response.entries || [], pagination: response.pagination };
};

// NEW FUNCTIONS FOR CALENDAR
export const getEntriesByDate = async (date: string): Promise<DiaryEntry[]> => {
  try {
    // Use the existing getEntries with date filter
    const result = await getEntries({ date } as DiaryFilters);
    return result.entries || [];
  } catch (error) {
    console.error("Error fetching entries by date:", error);
    return [];
  }
};

export const getEntriesByMonth = async (
  month: string
): Promise<DiaryEntry[]> => {
  try {
    // Use the existing getEntries with month filter
    const result = await getEntries({ month } as DiaryFilters);
    return result.entries || [];
  } catch (error) {
    console.error("Error fetching entries by month:", error);
    return [];
  }
};
export const deleteEntryByDate = async (
  entryDate: string
): Promise<{ message: string }> => {
  const response = await request(`/entries/date/${entryDate}`, {
    method: "DELETE",
  });
  return response;
};

export const getEntriesByDateRange = async (
  startDate: string,
  endDate: string
): Promise<DiaryEntry[]> => {
  try {
    // Use the existing getEntries with date range filters
    const result = await getEntries({
      startDate,
      endDate,
    } as DiaryFilters);
    return result.entries || [];
  } catch (error) {
    console.error("Error fetching entries by date range:", error);
    return [];
  }
};

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
