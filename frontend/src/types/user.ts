import type { User, UserRole } from './auth';
import type { Entry } from './entries';

export type UserProfile = User & {
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string;
  preferences: UserPreferences;
  stats: UserStats;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
};

export type UserPreferences = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
  defaultView: 'list' | 'calendar' | 'grid';
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dailyReminder: boolean;
  reminderTime?: string;
  weekStartsOn: 'sunday' | 'monday';
  entryFormat: 'plain' | 'markdown';
  autoSave: boolean;
  defaultMood?: string;
  defaultTags?: string[];
};

export type UserStats = {
  totalEntries: number;
  entriesThisMonth: number;
  entriesThisYear: number;
  streak: number;
  longestStreak: number;
  averageWordsPerEntry: number;
  totalWords: number;
  joinedDate: string;
  lastActive: string;
  mostUsedMood?: string;
  mostUsedTags: string[];
  completionRate: number; // percentage of days with entries
};

export type UserProfileUpdate = Partial<{
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  dateOfBirth: string;
  profilePicture: string;
  socialLinks: Partial<{
    twitter: string;
    github: string;
    linkedin: string;
  }>;
  preferences: Partial<UserPreferences>;
}>;

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type DeleteAccountData = {
  password: string;
  confirmation: string;
  reason?: string;
};

export type EmailPreferencesUpdate = {
  emailNotifications: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  monthlySummary: boolean;
  entryReminders: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
};

export type NotificationSettings = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  mobileNotifications: boolean;
  notificationTypes: {
    newFollower: boolean;
    entryReminders: boolean;
    streakAlerts: boolean;
    monthlyReports: boolean;
    systemUpdates: boolean;
  };
};

export type SecuritySettings = {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  passwordLastChanged: string;
  activeSessions: UserSession[];
  trustedDevices: TrustedDevice[];
};

export type UserSession = {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
};

export type TrustedDevice = {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastUsed: string;
  addedAt: string;
};

export type DataExportRequest = {
  format: 'json' | 'csv' | 'pdf';
  include: ('entries' | 'profile' | 'preferences' | 'statistics')[];
  dateFrom?: string;
  dateTo?: string;
};

export type DataExport = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  size?: number;
  downloadUrl?: string;
  createdAt: string;
  expiresAt: string;
};

export type SubscriptionPlan = {
  id: string;
  name: 'free' | 'premium' | 'pro';
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    entries: number;
    storage: number; // in MB
    tags: number;
    exports: number;
    customMoods: number;
  };
};

export type UserSubscription = {
  plan: SubscriptionPlan['name'];
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  features: string[];
};

export type BillingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
};

export type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  periodStart: string;
  periodEnd: string;
  downloadUrl?: string;
};