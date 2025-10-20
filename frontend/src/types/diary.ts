export type DiaryType = "NORMAL" | "SECRET" | "MEMORY" | "QUICK_NOTE";

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
  entryDate?: string; // Add this for calendar functionality
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
  entryDate?: string; // Add this for updates if needed
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
  entryDate: string; // This should be in your DiaryEntry based on Prisma schema
  createdAt: string;
  updatedAt: string;
};

export type DiaryStats = {
  totalEntries: number;
  entriesByType: Array<{
    diaryType: DiaryType;
    count: number;
  }>;
  entriesByMood: Array<{
    mood: string;
    count: number;
  }>;
  recentActivity: number; // Entries in last 7 days
  monthlyStats: Record<string, number>; // YYYY-MM format keys
  averageMoodIntensity?: number;
  mostUsedTags: string[];
  longestStreak: number; // Consecutive days with entries
  currentStreak: number;
  weeklyAverage: number; // Average entries per week
  monthlyAverage: number; // Average entries per month
};

export type DiaryFilters = {
  // Date filters
  date?: string; // Specific date (YYYY-MM-DD)
  year?: string; // Year (YYYY)
  month?: string; // Month (YYYY-MM)
  startDate?: string; // Start date for range (YYYY-MM-DD)
  endDate?: string; // End date for range (YYYY-MM-DD)
  dateFrom?: string; // Alternative name for startDate
  dateTo?: string; // Alternative name for endDate
  
  // Content filters
  diaryType?: DiaryType;
  mood?: string;
  tags?: string[];
  search?: string; // Full-text search in title and content
  
  // Privacy filters
  isLocked?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'entryDate' | 'title';
  sortOrder?: 'asc' | 'desc';
};

export type LockedDiaryAccess = {
  entryId: number;
  password?: string;
};

// Additional types for analytics and reporting
export type MonthlyStats = {
  month: string; // YYYY-MM
  entries: number;
  averageMood?: number;
  mostCommonMood?: string;
  wordCount?: number;
};

export type MoodAnalytics = {
  mood: string;
  count: number;
  percentage: number;
  averageIntensity: number;
  lastUsed: string;
};

export type TagAnalytics = {
  tag: string;
  count: number;
  percentage: number;
  lastUsed: string;
};

export type WritingStats = {
  totalWords: number;
  averageWordsPerEntry: number;
  longestEntry: number;
  shortestEntry: number;
  mostProductiveDay: string; // day of week
  writingTimeStats: {
    morning: number; // 6AM-12PM
    afternoon: number; // 12PM-6PM  
    evening: number; // 6PM-12AM
    night: number; // 12AM-6AM
  };
};