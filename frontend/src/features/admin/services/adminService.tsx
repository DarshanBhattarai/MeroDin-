import type { 
  AdminStatsResponse,
  SystemLogsResponse,
  UsersResponse,
  UserResponse,
  AdminsResponse,
  MessageResponse,
  AdminUser
} from '@/types/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.statusText}`);
  }

  return data;
}

// Admin Statistics
export async function getAdminStats(): Promise<AdminStatsResponse> {
  return apiFetch<AdminStatsResponse>("/api/admin/stats");
}

// System Logs
// Update the function signature to use type
export async function getSystemLogs(params: { 
  page?: number; 
  limit?: number; 
  type?: string; 
  userId?: string;
} = {}): Promise<SystemLogsResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.type) queryParams.append('type', params.type);
  if (params.userId) queryParams.append('userId', params.userId);

  const endpoint = `/api/admin/logs?${queryParams.toString()}`;
  return apiFetch<SystemLogsResponse>(endpoint);
}
// User Management
export async function getUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
} = {}): Promise<UsersResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);

  const endpoint = `/api/admin/users?${queryParams.toString()}`;
  return apiFetch<UsersResponse>(endpoint);
}

export async function getUserDetails(userId: string): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/admin/users/${userId}`);
}

export async function updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<{ user: AdminUser; message: string }> {
  return apiFetch<{ user: AdminUser; message: string }>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function deleteUser(userId: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}

// Admin Management
export async function getAdmins(): Promise<AdminsResponse> {
  return apiFetch<AdminsResponse>("/api/admin/admins");
}

export async function updateAdminPermissions(userId: string, permissions: string[]): Promise<{ admin: any; message: string }> {
  return apiFetch<{ admin: any; message: string }>(`/api/admin/admins/${userId}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissions }),
  });
}