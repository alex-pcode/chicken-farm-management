import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl mb-4">
      <div className="flex-shrink-0">
        <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm sm:text-base font-medium text-gray-800 truncate">
          {user.email}
        </span>
        <span className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Welcome back!
        </span>
      </div>
    </div>
  );
};
