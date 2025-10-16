import { useState, useEffect, useRef } from "react";
import { DiaryEntry, CreateDiaryEntryInput, UpdateDiaryEntryInput, DiaryStats, DiaryFilters } from "@/types/diary";
import { diaryService } from "../services/diaryService";

type LoadingMap = {
  [key: string]: boolean;
};

export const useDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadingMap = useRef<LoadingMap>({});

  const isLoading = (key: string) => !!loadingMap.current[key];

  // --- Helper to handle API calls safely ---
  const handleRequest = async <T>(key: string, fn: () => Promise<T>): Promise<T | null> => {
    if (isLoading(key)) return null; // prevent duplicate calls
    loadingMap.current[key] = true;
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      setError(msg);
      return null;
    } finally {
      loadingMap.current[key] = false;
    }
  };

  // --- CRUD Operations ---
  const createEntry = async (data: CreateDiaryEntryInput) => {
    return handleRequest("createEntry", async () => {
      const newEntry = await diaryService.createEntry(data);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    });
  };

  const updateEntry = async (id: number, data: UpdateDiaryEntryInput) => {
    return handleRequest(`updateEntry-${id}`, async () => {
      const updated = await diaryService.updateEntry(id, data);
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    });
  };

  const deleteEntry = async (id: number) => {
    return handleRequest(`deleteEntry-${id}`, async () => {
      await diaryService.deleteEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return true;
    });
  };

  const fetchEntries = async (filters?: DiaryFilters) => {
    return handleRequest("fetchEntries", async () => {
      const response = await diaryService.getEntries(filters);
      setEntries(response?.entries || []);
      return response?.entries || [];
    });
  };

  const fetchMyEntries = async (filters?: { diaryType?: string; mood?: string }) => {
    return handleRequest("fetchMyEntries", async () => {
      const myEntries = await diaryService.getMyEntries(filters);
      setEntries(myEntries || []);
      return myEntries || [];
    });
  };

  return {
    entries,
    error,
    loadingMap: loadingMap.current,
    createEntry,
    updateEntry,
    deleteEntry,
    fetchEntries,
    fetchMyEntries,
    isLoading,
  };
};

// --- Single diary entry hook ---
export const useDiaryEntry = (id?: number) => {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEntry = async () => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const e = await diaryService.getEntryById(id);
      setEntry(e || null);
      return e;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch entry";
      setError(msg);
      setEntry(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateThisEntry = async (data: UpdateDiaryEntryInput) => {
    if (!id) return null;
    setLoading(true);
    setError(null);
    try {
      const updated = await diaryService.updateEntry(id, data);
      setEntry(updated);
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update entry";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteThisEntry = async () => {
    if (!id) return false;
    setLoading(true);
    setError(null);
    try {
      await diaryService.deleteEntry(id);
      setEntry(null);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete entry";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEntry();
  }, [id]);

  return { entry, error, loading, fetchEntry, updateEntry: updateThisEntry, deleteEntry: deleteThisEntry };
};

// --- Analytics hook ---
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
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch analytics";
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
