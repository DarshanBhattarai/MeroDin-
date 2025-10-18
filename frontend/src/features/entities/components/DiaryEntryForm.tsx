import React, { useState } from 'react';
import { CreateDiaryEntryInput, UpdateDiaryEntryInput, DiaryType } from '@/types/diary';

type DiaryEntryFormProps = {
  initialData?: Partial<CreateDiaryEntryInput> & { entryDate?: string };
  onSubmit: (data: CreateDiaryEntryInput | UpdateDiaryEntryInput) => Promise<void>;
  loading?: boolean;
  submitText?: string;
  // Add prop to show date info when coming from calendar
  showDateInfo?: boolean;
};

const MOOD_OPTIONS = [
  'Happy', 'Sad', 'Excited', 'Calm', 'Anxious', 'Grateful',
  'Motivated', 'Tired', 'Peaceful', 'Confused', 'Loved', 'Stressed'
];

const DIARY_TYPE_LABELS = {
  NORMAL: 'Normal Entry',
  SECRET: 'Secret',
  MEMORY: 'Memory',
  QUICK_NOTE: 'Quick Note'
};

export const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  submitText = 'Create Entry',
  showDateInfo = false
}) => {
  // Determine entry date: use provided date or current date
  const entryDate = initialData?.entryDate || new Date().toISOString();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    contentRaw: initialData?.contentRaw || '',
    mood: initialData?.mood || '',
    moodIntensity: initialData?.moodIntensity ?? 5,
    diaryType: (initialData?.diaryType || 'NORMAL') as DiaryType,
    tags: initialData?.tags?.join(', ') || '',
    location: initialData?.location || '',
    isLocked: initialData?.isLocked || false,
    passwordHint: initialData?.passwordHint || '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const submitData: CreateDiaryEntryInput | UpdateDiaryEntryInput = {
      title: formData.title,
      contentRaw: formData.contentRaw,
      mood: formData.mood || undefined,
      moodIntensity: formData.moodIntensity || undefined,
      diaryType: formData.diaryType,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      location: formData.location || undefined,
      isLocked: formData.isLocked,
      passwordHint: formData.passwordHint || undefined,
      // Include entryDate for new entries (not for updates unless explicitly provided)
      ...(initialData?.entryDate && { entryDate: initialData.entryDate }),
    };

    try {
      await onSubmit(submitData);
    } catch (error: any) {
      const message = error?.response?.status === 409
        ? "You already created a diary for today."
        : error?.message || "Something went wrong. Please try again.";
      setErrorMessage(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Date Information - Only show when coming from calendar */}
      {showDateInfo && initialData?.entryDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="font-medium">Creating entry for:</p>
              <p className="text-sm">{formatDate(initialData.entryDate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="What's on your mind today?"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="contentRaw" className="block text-sm font-medium text-gray-700 mb-2">
          Your Thoughts *
        </label>
        <textarea
          id="contentRaw"
          required
          rows={8}
          value={formData.contentRaw}
          onChange={(e) => handleChange('contentRaw', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
          placeholder="Write your heart out... Share your thoughts, feelings, and experiences from today."
        />
      </div>

      {/* Mood & Intensity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling?
          </label>
          <select
            id="mood"
            value={formData.mood}
            onChange={(e) => handleChange('mood', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select a mood</option>
            {MOOD_OPTIONS.map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="moodIntensity" className="block text-sm font-medium text-gray-700 mb-2">
            Intensity: <span className="text-blue-600 font-semibold">{formData.moodIntensity}/10</span>
          </label>
          <input
            type="range"
            id="moodIntensity"
            min={1}
            max={10}
            value={formData.moodIntensity}
            onChange={(e) => handleChange('moodIntensity', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Diary Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Entry Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['NORMAL', 'SECRET', 'MEMORY', 'QUICK_NOTE'] as DiaryType[]).map(type => (
            <label 
              key={type} 
              className={`
                relative flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all
                ${formData.diaryType === type 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }
              `}
            >
              <input
                type="radio"
                name="diaryType"
                value={type}
                checked={formData.diaryType === type}
                onChange={(e) => handleChange('diaryType', e.target.value as DiaryType)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-center">
                {DIARY_TYPE_LABELS[type]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags & Location Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="work, travel, family (comma separated)"
          />
          <p className="text-xs text-gray-500 mt-1">Add tags to categorize your entry</p>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Where are you writing from?"
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="isLocked"
            checked={formData.isLocked}
            onChange={(e) => handleChange('isLocked', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isLocked" className="ml-2 text-sm font-medium text-gray-700">
            Make this entry private
          </label>
        </div>
        
        {formData.isLocked && (
          <div className="mt-3 pl-6 border-l-2 border-blue-200">
            <label htmlFor="passwordHint" className="block text-sm font-medium text-gray-700 mb-2">
              Password Hint (optional)
            </label>
            <input
              type="text"
              id="passwordHint"
              value={formData.passwordHint}
              onChange={(e) => handleChange('passwordHint', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="A hint to help you remember the password"
            />
            <p className="text-xs text-gray-500 mt-1">
              This hint will help you remember the password to unlock this entry later.
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};