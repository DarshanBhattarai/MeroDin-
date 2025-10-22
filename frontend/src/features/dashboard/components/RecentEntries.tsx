"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, PlusCircle, Lock } from 'lucide-react';
import { DiaryEntry } from '@/types/diary';
import { securityUtils } from '@/utils/securityUtils';

type RecentEntriesProps = {
  entries: DiaryEntry[];
};

export const RecentEntries: React.FC<RecentEntriesProps> = ({ entries }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const decryptEntryForUI = (entry: DiaryEntry) => ({
    ...entry,
    title: entry.title ? securityUtils.decrypt(entry.title) : 'Untitled',
    contentRaw: entry.contentRaw ? securityUtils.decrypt(entry.contentRaw) : '',
  });

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No entries yet</h3>
          <p className="text-gray-500 mb-4">Start writing your first diary entry</p>
          <Link
            href="/entries/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create First Entry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Recent Entries</h2>
        <Link
          href="/entries"
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100">
        {entries.slice(0, 5).map((rawEntry) => {
          const entry = decryptEntryForUI(rawEntry);

          const diaryTypeColor = (() => {
            switch (entry.diaryType) {
              case 'NORMAL':
                return 'bg-gray-100 text-gray-800';
              case 'SECRET':
                return 'bg-red-100 text-red-800';
              case 'MEMORY':
                return 'bg-purple-100 text-purple-800';
              default:
                return 'bg-green-100 text-green-800';
            }
          })();

          return (
            <Link
              key={entry.id}
              href={`/entries/${entry.id}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 truncate flex-1 mr-4">
                  {entry.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(entry.createdAt)}
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {entry.contentRaw}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {entry.mood && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {entry.mood}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${diaryTypeColor}`}>
                    {entry.diaryType?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>

                {entry.isLocked && <Lock className="w-4 h-4 text-yellow-500" />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
