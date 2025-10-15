import { useState, useEffect } from 'react';
import { DiaryEntry, CreateDiaryEntryInput, UpdateDiaryEntryInput, DiaryStats, DiaryFilters } from '@/types/diary';
import { diaryService } from '../services/diaryService';

export const useDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEntry = async (data: CreateDiaryEntryInput): Promise<DiaryEntry> => {
    try {
      setLoading(true);
      setError(null);
      const newEntry = await diaryService.createEntry(data);
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (id: number, data: UpdateDiaryEntryInput): Promise<DiaryEntry> => {
    try {
      setLoading(true);
      setError(null);
      const updatedEntry = await diaryService.updateEntry(id, data);
      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await diaryService.deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (filters?: DiaryFilters): Promise<DiaryEntry[]> => {
    try {
      setLoading(true);
      setError(null);
      const response = await diaryService.getEntries(filters);
      setEntries(response.entries);
      return response.entries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEntries = async (filters?: { diaryType?: string; mood?: string }): Promise<DiaryEntry[]> => {
    try {
      setLoading(true);
      setError(null);
      const myEntries = await diaryService.getMyEntries(filters);
      setEntries(myEntries);
      return myEntries;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your entries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    fetchEntries,
    fetchMyEntries,
  };
};

export const useDiaryEntry = (id: number) => {
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntry = async (): Promise<DiaryEntry> => {
    try {
      setLoading(true);
      setError(null);
      const entryData = await diaryService.getEntryById(id);
      setEntry(entryData);
      return entryData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (data: UpdateDiaryEntryInput): Promise<DiaryEntry> => {
    try {
      setLoading(true);
      setError(null);
      const updatedEntry = await diaryService.updateEntry(id, data);
      setEntry(updatedEntry);
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await diaryService.deleteEntry(id);
      setEntry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  return {
    entry,
    loading,
    error,
    fetchEntry,
    updateEntry,
    deleteEntry,
  };
};

export const useDiaryAnalytics = () => {
  const [stats, setStats] = useState<DiaryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (): Promise<DiaryStats> => {
    try {
      setLoading(true);
      setError(null);
      const analytics = await diaryService.getAnalytics();
      setStats(analytics);
      return analytics;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchAnalytics,
  };
};