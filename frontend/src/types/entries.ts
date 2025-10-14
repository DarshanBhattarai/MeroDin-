import type { User } from './auth';

export type Entry = {
  id: number;
  title: string;
  content: string;
  date: string;
  author: User;
  mood?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  wordCount?: number;
  isPublic?: boolean;
};

export type EntryCreate = {
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
  isPublic?: boolean;
};

export type EntryUpdate = Partial<{
  title: string;
  content: string;
  date: string;
  mood: string;
  tags: string[];
  isPublic: boolean;
}>;

export type EntryFilters = {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  mood?: string;
  tags?: string[];
  isPublic?: boolean;
};

export type EntryStats = {
  totalEntries: number;
  entriesThisMonth: number;
  averageWordsPerEntry: number;
  mostUsedMood?: string;
  mostUsedTags: string[];
};