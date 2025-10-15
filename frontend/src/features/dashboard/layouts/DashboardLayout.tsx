'use client';

import React from 'react';
import { DashboardSidebar } from '../components/DashboardSidebar';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};