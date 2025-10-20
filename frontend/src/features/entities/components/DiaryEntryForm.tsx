import React, { useState } from 'react';
import { 
  Calendar, 
  Lock, 
  MapPin, 
  Tag, 
  Image, 
  Smile, 
  BookOpen,
  Shield,
  Clock,
  Sparkles,
  X,
  Upload,
  AlertCircle
} from 'lucide-react';

type DiaryType = 'NORMAL' | 'SECRET' | 'MEMORY' | 'QUICK_NOTE';

type CreateDiaryEntryInput = {
  title: string;
  contentRaw: string;
  mood?: string;
  moodIntensity?: number;
  diaryType: DiaryType;
  tags: string[];
  location?: string;
  isLocked: boolean;
  passwordHint?: string;
  mediaUrls: string[];
  entryDate?: string;
};

type DiaryEntryFormProps = {
  initialData?: Partial<CreateDiaryEntryInput> & { entryDate?: string };
  onSubmit: (data: CreateDiaryEntryInput) => Promise<void>;
  loading?: boolean;
  submitText?: string;
  showDateInfo?: boolean;
};

const MOOD_OPTIONS = [
  { value: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'Sad', emoji: '😢', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'Excited', emoji: '🤩', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'Calm', emoji: '😌', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'Anxious', emoji: '😰', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'Grateful', emoji: '🙏', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'Motivated', emoji: '💪', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'Tired', emoji: '😴', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'Peaceful', emoji: '☮️', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: 'Confused', emoji: '😕', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'Loved', emoji: '🥰', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { value: 'Stressed', emoji: '😤', color: 'bg-amber-100 text-amber-700 border-amber-200' }
];

const DIARY_TYPES = [
  { value: 'NORMAL', label: 'Normal Entry', icon: BookOpen, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'SECRET', label: 'Secret', icon: Shield, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 'MEMORY', label: 'Memory', icon: Sparkles, color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { value: 'QUICK_NOTE', label: 'Quick Note', icon: Clock, color: 'bg-green-50 border-green-200 text-green-700' }
];

export const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  submitText = 'Create Entry',
  showDateInfo = false
}) => {
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
    mediaUrls: initialData?.mediaUrls || [],
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('basic');

  const handleChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const urls: string[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      urls.push(url);
    });

    handleChange('mediaUrls', [...formData.mediaUrls, ...urls]);
  };

  const handleRemoveMedia = (index: number) => {
    const updated = [...formData.mediaUrls];
    updated.splice(index, 1);
    handleChange('mediaUrls', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const submitData: CreateDiaryEntryInput = {
      title: formData.title,
      contentRaw: formData.contentRaw,
      mood: formData.mood || undefined,
      moodIntensity: formData.moodIntensity || undefined,
      diaryType: formData.diaryType,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      location: formData.location || undefined,
      isLocked: formData.isLocked,
      passwordHint: formData.passwordHint || undefined,
      mediaUrls: formData.mediaUrls,
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

  const selectedMood = MOOD_OPTIONS.find(m => m.value === formData.mood);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Entry</h1>
          <p className="text-gray-600">Capture your thoughts, memories, and moments</p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Date Info */}
        {showDateInfo && initialData?.entryDate && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Writing for</p>
              <p className="text-blue-700">{formatDate(initialData.entryDate)}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  placeholder="What's on your mind today?"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Thoughts <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.contentRaw}
                  onChange={(e) => handleChange('contentRaw', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-vertical text-gray-900 placeholder-gray-400"
                  placeholder="Write your heart out... Share your thoughts, feelings, and experiences."
                />
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{formData.contentRaw.length} characters</span>
                  <span>{formData.contentRaw.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Selection Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">How are you feeling?</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Mood Options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {MOOD_OPTIONS.map(mood => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => handleChange('mood', mood.value)}
                    className={`
                      p-3 rounded-xl border-2 transition-all hover:scale-105
                      ${formData.mood === mood.value 
                        ? `${mood.color} border-current shadow-md` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs font-medium">{mood.value}</div>
                  </button>
                ))}
              </div>

              {/* Mood Intensity */}
              {formData.mood && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Intensity Level: <span className="text-indigo-600">{formData.moodIntensity}/10</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={formData.moodIntensity}
                    onChange={(e) => handleChange('moodIntensity', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Intense</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Entry Type Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Entry Type</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIARY_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('diaryType', type.value as DiaryType)}
                      className={`
                        p-4 rounded-xl border-2 transition-all hover:scale-105
                        ${formData.diaryType === type.value 
                          ? `${type.color} border-current shadow-md` 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium text-center">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Additional Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Tags & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="work, travel, family"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Where are you?"
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  Media
                </label>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">Upload images or videos</span>
                  </label>
                </div>
                
                {formData.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                    {formData.mediaUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        {url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={url} className="w-full h-24 object-cover rounded-lg" />
                        ) : (
                          <img src={url} className="w-full h-24 object-cover rounded-lg" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy Settings Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
              </div>
            </div>
            <div className="p-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => handleChange('isLocked', e.target.checked)}
                  className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                    Make this entry private
                  </div>
                  <div className="text-xs text-gray-500">
                    Protect this entry with a password
                  </div>
                </div>
              </label>
              
              {formData.isLocked && (
                <div className="mt-4 pl-8 border-l-2 border-amber-200 animate-in slide-in-from-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password Hint
                  </label>
                  <input
                    type="text"
                    value={formData.passwordHint}
                    onChange={(e) => handleChange('passwordHint', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="A hint to remember your password"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This hint will help you unlock this entry later
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 px-6 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{submitText}</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};