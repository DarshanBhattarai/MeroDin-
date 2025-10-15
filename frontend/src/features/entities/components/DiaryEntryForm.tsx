import React, { useState } from 'react';
import { CreateDiaryEntryInput, UpdateDiaryEntryInput, DiaryType } from '@/types/diary';

type DiaryEntryFormProps = {
  initialData?: CreateDiaryEntryInput;
  onSubmit: (data: CreateDiaryEntryInput | UpdateDiaryEntryInput) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

const MOOD_OPTIONS = [
  'Happy', 'Sad', 'Excited', 'Calm', 'Anxious', 'Grateful', 
  'Motivated', 'Tired', 'Peaceful', 'Confused', 'Loved', 'Stressed'
];

export const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  submitText = 'Create Entry'
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    contentRaw: initialData?.contentRaw || '',
    mood: initialData?.mood || '',
    moodIntensity: initialData?.moodIntensity || 5,
    diaryType: initialData?.diaryType || 'NORMAL' as DiaryType,
    tags: initialData?.tags?.join(', ') || '',
    location: initialData?.location || '',
    isLocked: initialData?.isLocked || false,
    passwordHint: initialData?.passwordHint || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      title: formData.title,
      contentRaw: formData.contentRaw,
      mood: formData.mood || undefined,
      moodIntensity: formData.moodIntensity || undefined,
      diaryType: formData.diaryType,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      location: formData.location || undefined,
      isLocked: formData.isLocked,
      passwordHint: formData.passwordHint || undefined,
    };

    await onSubmit(submitData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your heart out..."
        />
      </div>

      {/* Mood & Intensity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling?
          </label>
          <select
            id="mood"
            value={formData.mood}
            onChange={(e) => handleChange('mood', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a mood</option>
            {MOOD_OPTIONS.map(mood => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="moodIntensity" className="block text-sm font-medium text-gray-700 mb-2">
            Intensity: {formData.moodIntensity}/10
          </label>
          <input
            type="range"
            id="moodIntensity"
            min="1"
            max="10"
            value={formData.moodIntensity}
            onChange={(e) => handleChange('moodIntensity', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Diary Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['NORMAL', 'SECRET', 'MEMORY', 'QUICK_NOTE'] as DiaryType[]).map(type => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="diaryType"
                value={type}
                checked={formData.diaryType === type}
                onChange={(e) => handleChange('diaryType', e.target.value as DiaryType)}
                className="mr-2"
              />
              <span className="text-sm">{type.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="work, travel, family, friends"
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Where are you writing from?"
        />
      </div>

      {/* Lock Settings */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="isLocked"
            checked={formData.isLocked}
            onChange={(e) => handleChange('isLocked', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isLocked" className="text-sm font-medium text-gray-700">
            Lock this entry (make it private)
          </label>
        </div>

        {formData.isLocked && (
          <div>
            <label htmlFor="passwordHint" className="block text-sm font-medium text-gray-700 mb-2">
              Password Hint (optional)
            </label>
            <input
              type="text"
              id="passwordHint"
              value={formData.passwordHint}
              onChange={(e) => handleChange('passwordHint', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A hint to help you remember the password"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
};