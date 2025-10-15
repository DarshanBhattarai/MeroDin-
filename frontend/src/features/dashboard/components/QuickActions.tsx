import React from 'react';
import Link from 'next/link';
import { PlusCircle, BookOpen, Calendar, BarChart3 } from 'lucide-react';

const quickActions = [
  {
    title: 'New Entry',
    description: 'Write a new diary entry',
    href: '/entries/create',
    icon: PlusCircle,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    title: 'View All',
    description: 'Browse all your entries',
    href: '/entries',
    icon: BookOpen,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    title: 'Calendar',
    description: 'View entries by date',
    href: '/calendar',
    icon: Calendar,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    title: 'Analytics',
    description: 'See your insights',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-orange-500 hover:bg-orange-600'
  }
];

export const QuickActions: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 transition-all transform hover:scale-105 hover:shadow-md`}
            >
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-blue-100 text-sm opacity-90">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};