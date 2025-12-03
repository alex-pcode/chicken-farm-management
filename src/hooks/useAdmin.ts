import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if the current user is an admin
 * @returns {boolean} True if the user is an admin, false otherwise
 */
export const useAdmin = (): boolean => {
  const { isAdmin } = useAuth();
  return isAdmin;
};

/**
 * Hook to get admin status with loading state
 * @returns Object with isAdmin and loading state
 */
export const useAdminStatus = () => {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
};
