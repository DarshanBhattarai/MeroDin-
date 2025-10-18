'use client';

import { useState, useCallback } from 'react';
import type { DiaryEntry } from '../../../types/calendar';

export function useDiaryPreview() {
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const [previewData, setPreviewData] = useState<DiaryEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showPreview = useCallback((event: React.MouseEvent, diaryEntry: DiaryEntry) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setPreviewData(diaryEntry);
    setIsVisible(true);
  }, []);

  const hidePreview = useCallback(() => {
    setIsVisible(false);
    // Delay clearing data to allow smooth transition
    setTimeout(() => {
      setPreviewPosition(null);
      setPreviewData(null);
    }, 150);
  }, []);

  const updatePreviewPosition = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  }, []);

  return {
    previewPosition,
    previewData,
    isVisible,
    showPreview,
    hidePreview,
    updatePreviewPosition,
  };
}