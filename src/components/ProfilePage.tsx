import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, supabase } from '../contexts/AuthContext';
import { UserService } from '../services/api/UserService';
import type { ValidationError, UserProfile as UserProfileType } from '../types';

interface ProfileFormData {
  email: string;
  displayName: string;
  yearlyEggGoal: number;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    email: user?.email || '',
    displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
    yearlyEggGoal: 0
  });
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    goal: false
  });

  const userService = UserService.getInstance();

  // Load user profile data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(prev => ({ ...prev, profile: true }));
      try {
        const response = await userService.getUserProfile();
        if (response.success && response.data) {
          setUserProfile(response.data);
          // Update form with any existing goal data from user metadata
          if (user?.user_metadata?.yearly_egg_goal) {
            setFormData(prev => ({
              ...prev,
              yearlyEggGoal: user.user_metadata.yearly_egg_goal
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user, userService]);

  // Validation
  const validateForm = (): ValidationError[] => {
    const newErrors: ValidationError[] = [];
    
    if (!formData.displayName.trim()) {
      newErrors.push({
        field: 'displayName',
        message: 'Display name is required',
        type: 'required'
      });
    }

    if (!formData.email.trim()) {
      newErrors.push({
        field: 'email',
        message: 'Email is required',
        type: 'required'
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({
        field: 'email',
        message: 'Please enter a valid email address',
        type: 'invalid'
      });
    }

    if (formData.yearlyEggGoal < 0) {
      newErrors.push({
        field: 'yearlyEggGoal',
        message: 'Yearly goal cannot be negative',
        type: 'range'
      });
    }

    return newErrors;
  };

  // Handle form submission for basic profile info
  const handleProfileSave = async () => {
    setErrors([]);
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(prev => ({ ...prev, profile: true }));

    try {
      // Update auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: formData.displayName,
          yearly_egg_goal: formData.yearlyEggGoal
        }
      });

      if (updateError) {
        setErrors([{
          field: 'submit',
          message: updateError.message,
          type: 'invalid'
        }]);
        return;
      }

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors([{
        field: 'submit',
        message: 'Failed to update profile. Please try again.',
        type: 'invalid'
      }]);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setLoading(prev => ({ ...prev, password: true }));
    setErrors([]);
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/reset-password'
      });

      if (error) {
        setErrors([{
          field: 'password',
          message: error.message,
          type: 'invalid'
        }]);
      } else {
        setSuccessMessage('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors([{
        field: 'password',
        message: 'Failed to send password reset email. Please try again.',
        type: 'invalid'
      }]);
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // Get error for specific field
  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  // Calculate current year progress (simplified - would need actual egg production data)
  const calculateYearProgress = () => {
    if (!formData.yearlyEggGoal || formData.yearlyEggGoal === 0) return 0;
    // This is a placeholder - in real implementation would calculate based on actual egg entries
    // For now, return a placeholder value
    return 0;
  };

  const yearProgress = calculateYearProgress();

  return (
    <div className="content-wrapper space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-white">User Profile</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card bg-green-900/20 border-green-500/30 text-green-400"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span>{successMessage}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <span>👤</span>
            User Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="expense-input"
                placeholder="Enter your display name"
              />
              {getFieldError('displayName') && (
                <p className="expense-error">{getFieldError('displayName')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="expense-input"
                placeholder="Enter your email"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email changes require account verification and are currently disabled
              </p>
              {getFieldError('email') && (
                <p className="expense-error">{getFieldError('email')}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProfileSave}
              disabled={loading.profile}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.profile ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </div>
              ) : (
                '💾 Save Profile'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <span>💳</span>
            Subscription Management
          </h2>

          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">✨</span>
                <span className="text-green-400 font-medium">Free Plan</span>
              </div>
              <p className="text-gray-300 text-sm">
                You're currently on the free plan with unlimited access to all features.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                Premium subscription features coming soon:
              </p>
              <ul className="text-gray-400 text-xs space-y-1 ml-4">
                <li>• Advanced analytics and reporting</li>
                <li>• Multi-farm management</li>
                <li>• Integration with accounting software</li>
                <li>• Priority support</li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled
              className="btn btn-outline w-full opacity-50 cursor-not-allowed"
            >
              🚀 Upgrade to Premium (Coming Soon)
            </motion.button>
          </div>
        </motion.div>

        {/* Password Reset Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <span>🔒</span>
            Security Settings
          </h2>

          <div className="space-y-4">
            <div className="info-point">
              <span className="text-blue-400 text-lg">🔐</span>
              <div>
                <h3 className="text-white font-medium">Password Reset</h3>
                <p className="text-gray-400 text-sm">
                  Reset your password by receiving a secure link via email
                </p>
              </div>
            </div>

            {getFieldError('password') && (
              <p className="expense-error">{getFieldError('password')}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePasswordReset}
              disabled={loading.password}
              className="btn btn-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.password ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                  Sending Reset Email...
                </div>
              ) : (
                '🔄 Reset Password'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Yearly Goal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            <span>🎯</span>
            Yearly Production Goal
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Yearly Egg Production Goal
              </label>
              <input
                type="number"
                min="0"
                value={formData.yearlyEggGoal}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  yearlyEggGoal: Math.max(0, parseInt(e.target.value) || 0)
                }))}
                className="expense-input"
                placeholder="e.g. 1200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set your target number of eggs for the year
              </p>
              {getFieldError('yearlyEggGoal') && (
                <p className="expense-error">{getFieldError('yearlyEggGoal')}</p>
              )}
            </div>

            {formData.yearlyEggGoal > 0 && (
              <div className="info-point">
                <span className="text-yellow-400 text-lg">📊</span>
                <div>
                  <h3 className="text-white font-medium">Current Progress</h3>
                  <p className="text-gray-400 text-sm">
                    {yearProgress} eggs collected ({((yearProgress / formData.yearlyEggGoal) * 100).toFixed(1)}% of goal)
                  </p>
                  <div className="mt-2 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${Math.min(100, (yearProgress / formData.yearlyEggGoal) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProfileSave}
              disabled={loading.goal}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.goal ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving Goal...
                </div>
              ) : (
                '🎯 Save Goal'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};