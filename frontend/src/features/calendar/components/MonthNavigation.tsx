'use client';

import { useState } from 'react';

type MonthNavigationProps = {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onDateChange: (date: Date) => void;
  className?: string;
};

export function MonthNavigation({ 
  currentDate, 
  onNavigate, 
  onToday, 
  onDateChange,
  className = '' 
}: MonthNavigationProps) {
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    onNavigate(direction);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onDateChange(newDate);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    onDateChange(newDate);
    setIsYearSelectOpen(false);
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Left controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleMonthChange('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={onToday}
          className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          Today
        </button>

        <button
          onClick={() => handleMonthChange('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Next month"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Month and Year display with dropdowns */}
      <div className="flex items-center space-x-4">
        {/* Month dropdown */}
        <div className="relative">
          <select
            value={currentDate.getMonth()}
            onChange={(e) => handleMonthSelect(parseInt(e.target.value))}
            className="appearance-none px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
          >
            {monthNames.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Year dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsYearSelectOpen(!isYearSelectOpen)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            {currentDate.getFullYear()}
            <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isYearSelectOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors duration-200 ${
                    year === currentYear ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close year dropdown when clicking outside */}
      {isYearSelectOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsYearSelectOpen(false)}
        />
      )}
    </div>
  );
}