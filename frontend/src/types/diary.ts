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

export type UpdateDiaryEntryInput = Partial<CreateDiaryEntryInput>;

export type DiaryEntryResponse = {
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
  createdAt: Date;
  updatedAt: Date;
};

export type LockedDiaryAccess = {
  entryId: number;
  password?: string;
};