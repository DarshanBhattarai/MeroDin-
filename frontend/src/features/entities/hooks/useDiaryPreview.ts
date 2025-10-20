'use client';

import { useState, useCallback } from 'react';
import type { DiaryEntry } from '@/types/diary';

type PreviewPosition = {
  x: number;
  y: number;
};

export const useDiaryPreview = () => {
  const [previewData, setPreviewData] = useState<DiaryEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);

  // Show the tooltip
  const showPreview = useCallback((event: React.MouseEvent, entry: DiaryEntry) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 10, // Offset tooltip slightly
      y: rect.top,
    });
    setPreviewData(entry);
    setIsVisible(true);
  }, []);

  // Update tooltip position on mouse move
  const updatePreviewPosition = useCallback((event: React.MouseEvent) => {
    setPreviewPosition({
      x: event.clientX + 10,
      y: event.clientY + 10,
    });
  }, []);

  // Hide the tooltip
  const hidePreview = useCallback(() => {
    setIsVisible(false);
    setPreviewData(null);
    setPreviewPosition(null);
  }, []);

  return {
    previewData,
    isVisible,
    previewPosition,
    showPreview,
    hidePreview,
    updatePreviewPosition,
  };
};
