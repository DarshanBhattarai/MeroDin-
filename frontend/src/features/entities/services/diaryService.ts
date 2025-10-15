import { DiaryEntry, CreateDiaryEntryInput, UpdateDiaryEntryInput, DiaryStats, DiaryFilters } from '@/types/diary';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class DiaryService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}/diary${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Create new diary entry
  async createEntry(data: CreateDiaryEntryInput): Promise<DiaryEntry> {
    return this.request('/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get all diary entries with filters
  async getEntries(filters: DiaryFilters = {}): Promise<{
    entries: DiaryEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`/entries?${queryParams.toString()}`);
  }

  // Get user's personal diary entries
  async getMyEntries(filters: { diaryType?: string; mood?: string } = {}): Promise<DiaryEntry[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    return this.request(`/entries/my?${queryParams.toString()}`);
  }

  // Get single diary entry
  async getEntryById(id: number): Promise<DiaryEntry> {
    return this.request(`/entries/${id}`);
  }

  // Update diary entry
  async updateEntry(id: number, data: UpdateDiaryEntryInput): Promise<DiaryEntry> {
    return this.request(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete diary entry
  async deleteEntry(id: number): Promise<{ message: string }> {
    return this.request(`/entries/${id}`, {
      method: 'DELETE',
    });
  }

  // Get diary analytics
  async getAnalytics(): Promise<DiaryStats> {
    return this.request('/entries/analytics');
  }

  // Search diary entries
  async searchEntries(query: string, filters: { diaryType?: string; mood?: string } = {}): Promise<{
    entries: DiaryEntry[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams({ query });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    return this.request(`/entries/search?${queryParams.toString()}`);
  }
}

export const diaryService = new DiaryService();