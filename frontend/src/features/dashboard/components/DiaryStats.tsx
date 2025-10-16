import React from 'react';
import { BookOpen, Lock, Zap, BarChart3 } from 'lucide-react';
import { DiaryStats as DiaryStatsType } from '@/types/diary';

type DiaryStatsProps = {
  stats: DiaryStatsType | null;
};

export const DiaryStats: React.FC<DiaryStatsProps> = ({ stats }) => {
  // Safe data access with fallbacks
  const secretEntriesCount = stats?.entriesByType?.find(e => e.diaryType === 'SECRET')?._count.id || 0;
  
  const statCards = [
    {
      label: 'Total Entries',
      value: stats?.totalEntries || 0,
      icon: BookOpen,
      color: 'blue'
    },
    {
      label: 'This Month',
      value: stats?.recentActivity || 0,
      icon: Zap,
      color: 'green'
    },
    {
      label: 'Secret Entries',
      value: secretEntriesCount,
      icon: Lock,
      color: 'red'
    },
    {
      label: 'Avg Mood',
      value: stats?.averageMoodIntensity ? `${stats.averageMoodIntensity.toFixed(1)}/10` : 'N/A',
      icon: BarChart3,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      red: 'bg-red-50 text-red-700 border-red-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 ${getColorClasses(stat.color)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};