// src/app/admin/components/users/UserActions.tsx
'use client';

import { useState } from 'react';
import { updateUserRole, deleteUser } from '@/features/admin/services/adminService';
import type { AdminUser, UserRole } from '@/types/admin';

type UserActionsProps = {
  user: AdminUser;
  onViewDetails: () => void;
  onUserUpdate: (user: AdminUser) => void;
  onUserDelete: (userId: number) => void;
};

export default function UserActions({ user, onViewDetails, onUserUpdate, onUserDelete }: UserActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: UserRole) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await updateUserRole(user.id.toString(), newRole);
      onUserUpdate(response.user);
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await deleteUser(user.id.toString());
      onUserDelete(user.id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Note: Your backend doesn't have this endpoint yet
      // You'll need to add it to adminService if you implement this feature
      const response = await fetch(`/api/admin/users/${user.id}/verify-email`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        onUserUpdate(updatedUser.user);
      } else {
        throw new Error('Failed to verify email');
      }
    } catch (error) {
      console.error('Failed to verify email:', error);
      alert('Failed to verify email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isLoading}
        className="inline-flex justify-center w-8 h-8 bg-white border border-gray-300 rounded-md shadow-sm px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        )}
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  onViewDetails();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Details
              </button>

              {!user.isEmailVerified && (
                <button
                  onClick={() => {
                    handleVerifyEmail();
                    setIsDropdownOpen(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50"
                >
                  <svg className="mr-3 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify Email
                </button>
              )}

              <div className="border-t border-gray-100" />
              
              <div className="px-4 py-2 text-xs font-medium text-gray-500">
                Change Role
              </div>
              
              <button
                onClick={() => {
                  handleRoleChange('ADMIN');
                  setIsDropdownOpen(false);
                }}
                disabled={user.role === 'ADMIN' || isLoading}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="mr-3 h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Make Admin
              </button>
              
              <button
                onClick={() => {
                  handleRoleChange('USER');
                  setIsDropdownOpen(false);
                }}
                disabled={user.role === 'USER' || isLoading}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="mr-3 h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Make User
              </button>

              <div className="border-t border-gray-100" />
              
              <button
                onClick={() => {
                  handleDelete();
                  setIsDropdownOpen(false);
                }}
                disabled={isLoading}
                className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left disabled:opacity-50"
              >
                <svg className="mr-3 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}