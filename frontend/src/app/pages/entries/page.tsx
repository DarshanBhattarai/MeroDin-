'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DiaryEntryCard } from '@/features/entities/components/DiaryEntryCard';
import { useDiary } from '@/features/entities/hooks/useDiary';
import { DiaryType } from '@/types/diary';

export default function EntriesPage() {
  const { entries, loading, error, fetchMyEntries, deleteEntry } = useDiary();
  const [filters, setFilters] = useState({
    diaryType: '',
    mood: '',
  });

  useEffect(() => {
    fetchMyEntries(filters);
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(id);
      } catch (err) {
        alert('Failed to delete entry');
      }
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading your diary entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Diary Entries</h1>
            <p className="text-gray-600 mt-2">Your personal thoughts and memories</p>
          </div>
          <Link
            href="/entries/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Entry
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Type
              </label>
              <select
                value={filters.diaryType}
                onChange={(e) => setFilters(prev => ({ ...prev, diaryType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="NORMAL">Normal</option>
                <option value="SECRET">Secret</option>
                <option value="MEMORY">Memory</option>
                <option value="QUICK_NOTE">Quick Note</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood
              </label>
              <select
                value={filters.mood}
                onChange={(e) => setFilters(prev => ({ ...prev, mood: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Moods</option>
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Excited">Excited</option>
                <option value="Calm">Calm</option>
                <option value="Anxious">Anxious</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ diaryType: '', mood: '' })}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Entries Grid */}
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No diary entries yet. Start writing your story!
            </div>
            <Link
              href="/entries/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Entry
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <DiaryEntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}