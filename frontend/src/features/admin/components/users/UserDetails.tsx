// src/app/admin/components/users/UserDetails.tsx
'use client';

import { useState, useEffect } from 'react';
import { getUserDetails } from '@/features/admin/services/adminService';
import type { UserDetails as UserDetailsType } from '@/types/admin';

type UserDetailsProps = {
  user: UserDetailsType | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function UserDetails({ user, isOpen, onClose }: UserDetailsProps) {
  const [userDetails, setUserDetails] = useState<UserDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchUserDetails();
    } else {
      setUserDetails(null);
    }
  }, [user, isOpen]);

  const fetchUserDetails = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await getUserDetails(user.id.toString());
      setUserDetails(response.user);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayUser = userDetails || user;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Details
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Detailed information about {displayUser.fullName || displayUser.email}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isLoading ? (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading user details...</p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Full Name:</span>
                        <p className="text-sm">{displayUser.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Email:</span>
                        <p className="text-sm">{displayUser.email}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Role:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          displayUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {displayUser.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Login Type:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          displayUser.loginType === 'GOOGLE' ? 'bg-red-100 text-red-800' :
                          displayUser.loginType === 'GITHUB' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {displayUser.loginType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Account Status</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-500">Email Verified:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                          displayUser.isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {displayUser.isEmailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Member Since:</span>
                        <p className="text-sm">{formatDate(displayUser.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Last Updated:</span>
                        <p className="text-sm">{formatDate(displayUser.updatedAt)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Diary Entries:</span>
                        <p className="text-sm">{displayUser._count?.diaryEntries || 0}</p>
                      </div>
                      {displayUser.adminProfile?.lastLogin && (
                        <div>
                          <span className="text-xs text-gray-500">Last Login:</span>
                          <p className="text-sm">{formatDate(displayUser.adminProfile.lastLogin)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Diary Entries */}
                  <div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Recent Diary Entries ({(userDetails?.diaryEntries || []).length})
                    </h4>
                    {(userDetails?.diaryEntries || []).length > 0 ? (
                      <div className="space-y-3">
                        {(userDetails?.diaryEntries || []).slice(0, 5).map((entry) => (
                          <div key={entry.id} className="border-l-4 border-blue-500 pl-3">
                            <div className="flex justify-between items-start">
                              <h5 className="text-sm font-medium text-gray-900">{entry.title}</h5>
                              {entry.mood && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                  {entry.mood}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No diary entries found.</p>
                    )}
                  </div>

                  {/* OTP Logs */}
                  <div className="bg-gray-50 p-4 rounded-lg sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Recent OTP Attempts ({(userDetails?.otpLogs || []).length})
                    </h4>
                    {(userDetails?.otpLogs || []).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(userDetails?.otpLogs || []).slice(0, 5).map((log) => (
                              <tr key={log.id}>
                                <td className="px-3 py-2 text-sm">{log.otpType}</td>
                                <td className="px-3 py-2 text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.success ? 'Success' : 'Failed'}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500">
                                  {formatDate(log.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No OTP logs found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}