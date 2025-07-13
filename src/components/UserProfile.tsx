import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
      <UserIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-medium text-gray-700 truncate">
          {user.email}
        </span>
        <span className="text-xs text-gray-500">
          Welcome back!
        </span>
      </div>
    </div>
  );
};
