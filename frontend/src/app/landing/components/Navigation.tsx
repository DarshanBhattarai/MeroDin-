// src/app/landing/components/Navigation.tsx
"use client";

import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="font-bold text-2xl text-indigo-900">Mero Din</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/auth/login" 
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}