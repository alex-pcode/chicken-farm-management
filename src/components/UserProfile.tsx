import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
      <div className="flex items-center space-x-2">
        <UserIcon className="h-6 w-6 text-gray-500" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {user.email}
          </span>
          <span className="text-xs text-gray-500">
            Welcome to Chicken Manager
          </span>
        </div>
      </div>
    </div>
  );
};
