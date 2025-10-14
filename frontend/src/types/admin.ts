export type UserRole = 'USER' | 'ADMIN';

export type LoginType = 'EMAIL' | 'GOOGLE' | 'GITHUB';

export type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
  activeUsersToday: number;
  newRegistrationsToday: number;
  totalDiaryEntries: number;
  diaryEntriesToday: number;
  verifiedUsers: number;
  oauthUsers: number;
  emailUsers: number;
  systemHealth: string;
  database: string;
  lastUpdated: string;
};

export type SystemLog = {
  id: number;
  userId: number;
  otpType: string;
  success: boolean;
  createdAt: string;
  user: {
    id: number;
    email: string;
    fullName: string | null;
  };
};

export type AdminUser = {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  loginType: LoginType;
  profilePicture?: string | null;
  createdAt: string;
  updatedAt: string;
  adminProfile?: {
    lastLogin: string | null;
    permissions: string[];
  };
  _count?: {
    diaryEntries: number;
    otpLogs: number;
  };
};

export type UserDetails = AdminUser & {
  diaryEntries: Array<{
    id: number;
    title: string;
    mood: string | null;
    createdAt: string;
  }>;
  otpLogs: Array<{
    id: number;
    otpType: string;
    success: boolean;
    createdAt: string;
  }>;
};

export type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Response Types
export type AdminStatsResponse = {
  stats: AdminStats;
};

export type SystemLogsResponse = {
  logs: SystemLog[];
  pagination: PaginationInfo;
};

export type UsersResponse = {
  users: AdminUser[];
  pagination: PaginationInfo;
};

export type UserResponse = {
  user: UserDetails;
};

export type AdminsResponse = {
  admins: AdminUser[];
};

export type MessageResponse = {
  message: string;
};