export type DiaryType = 'NORMAL' | 'SECRET' | 'MEMORY' | 'QUICK_NOTE';

export type CreateDiaryEntryInput = {
  title: string;
  contentRaw: string;
  mood?: string;
  moodIntensity?: number;
  diaryType: DiaryType;
  tags?: string[];
  mediaUrls?: string[];
  location?: string;
  isLocked?: boolean;
  passwordHint?: string;
};

export type UpdateDiaryEntryInput = {
  title?: string;
  contentRaw?: string;
  mood?: string;
  moodIntensity?: number;
  diaryType?: DiaryType;
  tags?: string[];
  mediaUrls?: string[];
  location?: string;
  isLocked?: boolean;
  passwordHint?: string;
};

export type DiaryEntry = {
  id: number;
  title: string;
  contentRaw: string;
  contentAI?: string;
  mood?: string;
  moodIntensity?: number;
  diaryType: DiaryType;
  tags: string[];
  mediaUrls: string[];
  location?: string;
  isLocked: boolean;
  passwordHint?: string;
  aiSummary?: string;
  aiKeywords: string[];
  createdAt: string;
  updatedAt: string;
};

export type DiaryStats = {
  totalEntries: number;
  entriesByType: Array<{
    diaryType: DiaryType;
    _count: { id: number };
  }>;
  entriesByMood: Array<{
    mood: string;
    _count: { id: number };
  }>;
  recentActivity: number;
  monthlyStats: Record<string, number>;
  averageMoodIntensity?: number;
};

export type DiaryFilters = {
  diaryType?: DiaryType;
  mood?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type LockedDiaryAccess = {
  entryId: number;
  password?: string;
};