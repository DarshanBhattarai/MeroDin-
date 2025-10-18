import { useState, useRef, useCallback, useEffect } from "react";
import {
  DiaryEntry,
  CreateDiaryEntryInput,
  UpdateDiaryEntryInput,
  DiaryStats,
  DiaryFilters,
} from "@/types/diary";
import { diaryService } from "../services/diaryService";

// ------------------- useDiary Hook -------------------
type LoadingMap = {
  [key: string]: boolean;
};

export const useDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadingMap = useRef<LoadingMap>({});

  const isLoading = (key: string) => !!loadingMap.current[key];

  const handleRequest = useCallback(async <T,>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T | null> => {
    if (isLoading(key)) return null;
    loadingMap.current[key] = true;
    setError(null);

    try {
      const result = await fn();
      return result;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setError(msg);
      return null;
    } finally {
      loadingMap.current[key] = false;
    }
  }, []);

  // ✅ Typed CRUD actions
  const createEntry = useCallback(
    async (data: CreateDiaryEntryInput) =>
      handleRequest("createEntry", async () => {
        const newEntry = await diaryService.createEntry(data);
        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      }),
    [handleRequest]
  );

  const updateEntry = useCallback(
    async (id: number, data: UpdateDiaryEntryInput) =>
      handleRequest(`updateEntry-${id}`, async () => {
        const updated = await diaryService.updateEntry(id, data);
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        return updated;
      }),
    [handleRequest]
  );

  const deleteEntry = useCallback(
    async (id: number) =>
      handleRequest(`deleteEntry-${id}`, async () => {
        await diaryService.deleteEntry(id);
        setEntries((prev) => prev.filter((e) => e.id !== id));
        return true;
      }),
    [handleRequest]
  );

  const fetchEntries = useCallback(
    async (filters?: DiaryFilters) =>
      handleRequest("fetchEntries", async () => {
        const response = await diaryService.getEntries(filters);
        setEntries(response?.entries || []);
        return response?.entries || [];
      }),
    [handleRequest]
  );

  const fetchMyEntries = useCallback(
    async (filters?: { diaryType?: string; mood?: string }) =>
      handleRequest("fetchMyEntries", async () => {
        if(entries.length > 0) return entries; 
        const myEntries = await diaryService.getMyEntries(filters);
        setEntries(myEntries || []);
        return myEntries || [];
      }),
    [handleRequest]
  );

  return {
    entries,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    fetchEntries,
    fetchMyEntries,
    isLoading,
  };
};

// ------------------- useDiaryAnalytics Hook -------------------
export const useDiaryAnalytics = () => {
  const [stats, setStats] = useState<DiaryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchAnalytics = async () => {
    if (loading || hasFetchedRef.current) return stats;
    setLoading(true);
    setError(null);

    try {
      const analytics = await diaryService.getAnalytics();
      setStats(analytics);
      hasFetchedRef.current = true;
      return analytics;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch analytics";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { stats, loading, error, fetchAnalytics };
};
