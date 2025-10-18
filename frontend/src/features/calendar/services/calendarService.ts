import { diaryService } from '../../../features/entities/services/diaryService';
import type { DiaryEntry, CalendarDay } from '@/types/calendar';

export class CalendarService {
  static async getMonthData(year: number, month: number): Promise<DiaryEntry[]> {
    try {
      const monthString = String(month + 1).padStart(2, '0');
      const targetMonth = `${year}-${monthString}`;
      
      // Use the new getEntriesByMonth function
      return await diaryService.getEntriesByMonth(targetMonth);
    } catch (error) {
      console.error('Error fetching month data:', error);
      // Fallback: Return empty array so calendar still renders
      return [];
    }
  }

  static async getDiaryByDate(date: string): Promise<DiaryEntry | null> {
    try {
      // Use the new getEntriesByDate function
      const entries = await diaryService.getEntriesByDate(date);
      return entries.length > 0 ? entries[0] : null;
    } catch (error) {
      console.error('Error fetching diary by date:', error);
      return null;
    }
  }

  static generateCalendarDays(year: number, month: number, diaryEntries: DiaryEntry[]): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    
    // Start from the first Sunday of the calendar view
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the last Saturday of the calendar view
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const diaryEntry = diaryEntries.find(entry => {
        const entryDate = new Date(entry.entryDate).toISOString().split('T')[0];
        return entryDate === dateString;
      });
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === today.toDateString(),
        diaryEntry,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }

  // Helper to generate preview from content
  static generatePreview(content: string, maxLength: number = 50): string {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  // Get mood color based on your schema
  static getMoodColor(mood?: string): string {
    const moodColors: Record<string, string> = {
      'happy': 'bg-yellow-100 border-yellow-300',
      'sad': 'bg-blue-100 border-blue-300',
      'excited': 'bg-green-100 border-green-300',
      'angry': 'bg-red-100 border-red-300',
      'calm': 'bg-indigo-100 border-indigo-300',
      'motivated': 'bg-purple-100 border-purple-300',
      'tired': 'bg-gray-100 border-gray-300',
      'anxious': 'bg-orange-100 border-orange-300',
    };
    
    return moodColors[mood?.toLowerCase() || ''] || 'bg-white border-gray-200';
  }

  // Format time for display
  static formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Get diary type badge color
  static getDiaryTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      'NORMAL': 'bg-gray-100 text-gray-800',
      'SECRET': 'bg-purple-100 text-purple-800',
      'MEMORY': 'bg-yellow-100 text-yellow-800',
      'QUICK_NOTE': 'bg-blue-100 text-blue-800',
    };
    
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  }
}