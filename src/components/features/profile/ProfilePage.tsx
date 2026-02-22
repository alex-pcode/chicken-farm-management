import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, supabase } from '../../../contexts/AuthContext';
import { UserService } from '../../../services/api/UserService';
import { useUserTier, useOptimizedAppData } from '../../../contexts/OptimizedDataProvider';
import { FormCard } from '../../ui/forms/FormCard';
import { FormButton } from '../../ui/forms/FormButton';
import { FormField } from '../../ui/forms/FormField';
import { NumberInput, SelectInput, ThemeToggle } from '../../ui/forms';
import { StatCard } from '../../ui/cards/StatCard';
import { PageContainer } from '../../ui/layout/PageContainer';
import { TabNavigation, Tab } from '../../ui/TabNavigation';
import { Breadcrumbs } from '../../ui/Breadcrumbs';
import { ConfirmDialog } from '../../ui/modals/ConfirmDialog';
import { HistoricalEggTrackingModal } from '../../ui/modals/HistoricalEggTrackingModal';
import { useEggData } from '../../../hooks/data/useEggData';
import type { ValidationError, UserProfile as UserProfileType } from '../../../types';

interface ProfileFormData {
  email: string;
  displayName: string;
  yearlyEggGoal: number;
  eggPrice: number;
  chickenGoal: 'hobby' | 'business';
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { userTier } = useUserTier();
  const { refreshData } = useOptimizedAppData();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'profile');
  const [formData, setFormData] = useState<ProfileFormData>({
    email: user?.email || '',
    displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
    yearlyEggGoal: 0,
    eggPrice: 0.30,
    chickenGoal: 'hobby'
  });
  const [, setUserProfile] = useState<UserProfileType | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    goal: false
  });
  const [showHistoricalModal, setShowHistoricalModal] = useState(false);

  const tabs: Tab[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'billing', label: 'Billing', icon: '💳' },
    { id: 'goals', label: 'Goals & Preferences', icon: '🎯' }
  ];

  const userService = UserService.getInstance();
  
  // Get real egg production data
  const { totalEggs, thisMonthTotal, thisWeekTotal, entries: eggEntries, addEntry } = useEggData();

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning' as 'warning' | 'danger' | 'success'
  });

  // Load user profile data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(prev => ({ ...prev, profile: true }));
      try {
        const response = await userService.getUserProfile();
        if (response.success && response.data) {
          setUserProfile(response.data);
          // Update form with any existing data from user metadata
          if (user?.user_metadata) {
            setFormData(prev => ({
              ...prev,
              yearlyEggGoal: user.user_metadata.yearly_egg_goal || 0,
              eggPrice: user.user_metadata.egg_price || 0.30,
              chickenGoal: user.user_metadata.chicken_goal || 'hobby'
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

    if (formData.eggPrice < 0) {
      newErrors.push({
        field: 'eggPrice',
        message: 'Egg price cannot be negative',
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
          yearly_egg_goal: formData.yearlyEggGoal,
          egg_price: formData.eggPrice,
          chicken_goal: formData.chickenGoal
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

  // Handle password reset with confirmation
  const handlePasswordResetClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Password',
      message: `Are you sure you want to reset your password? A reset link will be sent to ${user?.email}.`,
      variant: 'warning',
      onConfirm: handlePasswordReset
    });
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
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

  // Calculate current year progress using real egg production data
  const calculateYearProgress = () => {
    if (!formData.yearlyEggGoal || formData.yearlyEggGoal === 0) return 0;
    
    // For current year progress, we'll use total eggs collected so far
    // In a more sophisticated version, we could filter by current year only
    return totalEggs;
  };

  const yearProgress = calculateYearProgress();

  // Render functions for each tab
  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-8"
    >
      <FormCard
        title="Personal Information"
        subtitle="Update your profile details"
        icon="👤"
      >
        <div className="space-y-6">

          {/* Account Verification Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Fraunces, serif' }}>Account Verification</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-lg">✅</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Email Address</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Your email is verified and secure</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">Verified</span>
              </div>

            </div>
          </div>

          <FormField
            label="Display Name"
            error={getFieldError('displayName')}
            required
          >
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="neu-input w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#524AE6] focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
              placeholder="Enter your display name"
            />
          </FormField>

          <FormField
            label="Email Address"
            error={getFieldError('email')}
            help="Email changes require account verification and are currently disabled"
          >
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="neu-input w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#524AE6] focus:border-transparent transition-all duration-200 opacity-60 cursor-not-allowed text-gray-900 dark:text-white"
              placeholder="Enter your email"
              disabled
            />
          </FormField>

          <FormButton
            variant="primary"
            size="lg"
            onClick={handleProfileSave}
            loading={loading.profile}
            fullWidth
            type="button"
          >
            💾 Save Profile
          </FormButton>
        </div>
      </FormCard>

      {/* Appearance Settings */}
      <FormCard
        title="Appearance"
        subtitle="Customize your visual experience"
        icon="🎨"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Fraunces, serif' }}>Theme</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how ChickenCare looks to you. By default, it follows your device settings.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </FormCard>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <FormCard 
        title="Security Settings" 
        subtitle="Manage your account security"
        icon="🔒"
      >
        <div className="space-y-4">
          {/* Security Score */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <span className="text-green-500 text-lg">🛡️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Security Status: Secure</h3>
              <p className="text-gray-600 text-sm mt-1">Your account is protected with email verification and secure authentication</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all duration-300" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Your account security is fully configured</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-500 text-lg">🔐</span>
            <div>
              <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Password Reset</h3>
              <p className="text-gray-600 text-sm mt-1">
                Reset your password by receiving a secure link via email
              </p>
            </div>
          </div>

          {getFieldError('password') && (
            <div className="error-state p-3 rounded-lg">
              <p className="text-red-700">{getFieldError('password')}</p>
            </div>
          )}

          <FormButton
            variant="secondary"
            size="lg"
            onClick={handlePasswordResetClick}
            loading={loading.password}
            fullWidth
            type="button"
          >
            🔄 Reset Password
          </FormButton>
        </div>
      </FormCard>
    </motion.div>
  );

  const renderBillingTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <FormCard 
        title="Subscription Management" 
        subtitle="Manage your plan and billing"
        icon="💳"
      >
        <div className="space-y-4">
          <StatCard 
            variant="gradient"
            title="Current Plan"
            total={userTier.charAt(0).toUpperCase() + userTier.slice(1)}
            label={userTier === 'premium' ? 'Full access to all features' : 'Basic features available'}
            icon={userTier === 'premium' ? '⭐' : '✨'}
            className={userTier === 'premium' 
              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            }
          />

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
              {userTier === 'premium' ? 'Premium Features:' : 'Premium Features (Available after upgrade):'}
            </h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-center gap-2">📊 Dashboard analytics and insights</li>
              <li className="flex items-center gap-2">🐔 My Flock management</li>
              <li className="flex items-center gap-2">💼 Customer relationship management</li>
              <li className="flex items-center gap-2">💰 Expense tracking</li>
              <li className="flex items-center gap-2">🌾 Feed management</li>
              <li className="flex items-center gap-2">📈 Savings analysis</li>
              <li className="flex items-center gap-2">🧮 Viability calculator</li>
            </ul>
          </div>

          <FormButton
            variant="secondary"
            size="lg"
            fullWidth
            disabled
            type="button"
          >
            🚀 Upgrade to Premium (Coming Soon)
          </FormButton>
        </div>
      </FormCard>
    </motion.div>
  );

  const renderGoalsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-8"
    >
      {/* Chicken Goal Section */}
      <FormCard 
        title="Your Chicken Goals" 
        subtitle="Help us customize your experience based on your primary goal"
        icon="🐔"
      >
        <div className="space-y-4">
          <SelectInput
            label="What's your primary goal with raising chickens?"
            value={formData.chickenGoal}
            onChange={(value) => setFormData(prev => ({ ...prev, chickenGoal: value as 'hobby' | 'business' }))}
            options={[
              { 
                value: 'hobby', 
                label: 'Hobby/Family Use'
              },
              { 
                value: 'business', 
                label: 'Business/Profit'
              }
            ]}
          />
          
          {/* Hobby/Family Context */}
          {formData.chickenGoal === 'hobby' && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-lg">🏠</span>
                <div>
                  <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
                    Hobby/Family Focus
                  </h4>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    Perfect for backyard chicken enthusiasts! You're raising chickens primarily to:
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1 ml-4">
                    <li>• Feed your family fresh, healthy eggs</li>
                    <li>• Share extras with neighbors and friends</li>
                    <li>• Sell some eggs here and there for pocket money</li>
                    <li>• Enjoy the therapeutic hobby of chicken keeping</li>
                    <li>• Save money compared to buying expensive organic eggs</li>
                  </ul>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-green-100">
                    <p className="text-sm font-medium text-gray-900">📊 Your Savings tab will show:</p>
                    <p className="text-sm text-gray-600 mt-1">Money saved vs buying organic store eggs - perfect for tracking household cost benefits!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business/Profit Context */}
          {formData.chickenGoal === 'business' && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 text-lg">💼</span>
                <div>
                  <h4 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
                    Business/Profit Focus
                  </h4>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    Great for aspiring egg entrepreneurs! You're raising chickens primarily to:
                  </p>
                  <ul className="text-gray-600 text-sm mt-2 space-y-1 ml-4">
                    <li>• Generate consistent income from egg sales</li>
                    <li>• Build customer relationships and a local brand</li>
                    <li>• Scale your operation for maximum profitability</li>
                    <li>• Track real business metrics and cash flow</li>
                  </ul>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-sm font-medium text-gray-900">📈 Your Savings tab will show:</p>
                    <p className="text-sm text-gray-600 mt-1">Actual revenue vs expenses - ideal for monitoring business profitability and growth!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormCard>

      {/* Pricing Configuration Section */}
      <FormCard 
        title="Pricing Configuration" 
        subtitle="Set your egg pricing preferences"
        icon="💰"
      >
        <NumberInput
          label="Price per Egg ($)"
          value={formData.eggPrice}
          onChange={(value) => setFormData(prev => ({ ...prev, eggPrice: value }))}
          step={0.01}
          min={0}
          placeholder="0.30"
          showSpinner={false}
          selectAllOnFocus={true}
          errors={errors}
        />
      </FormCard>

      {/* Production Goals Section */}
      <FormCard 
        title="Production Goals" 
        subtitle="Track your annual egg production target"
        icon="🎯"
      >
        <div className="space-y-4">
          <FormField
            label="Yearly Egg Production Goal"
            error={getFieldError('yearlyEggGoal')}
            help="Set your target number of eggs for the year"
          >
            <input
              type="number"
              min="0"
              value={formData.yearlyEggGoal}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                yearlyEggGoal: Math.max(0, parseInt(e.target.value) || 0)
              }))}
              className="neu-input w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#524AE6] focus:border-transparent transition-all duration-200"
              placeholder="e.g. 1200"
            />
          </FormField>

          {formData.yearlyEggGoal > 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-[#524AE6]/10 rounded-lg border border-[#524AE6]/20">
                <span className="text-[#524AE6] text-lg">📊</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Annual Progress</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {yearProgress} eggs collected ({((yearProgress / formData.yearlyEggGoal) * 100).toFixed(1)}% of goal)
                  </p>
                  <div className="mt-3 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-[#524AE6] to-[#4338CA] rounded-full h-3 transition-all duration-300"
                      style={{ width: `${Math.min(100, (yearProgress / formData.yearlyEggGoal) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  title="This Month"
                  total={thisMonthTotal.toString()}
                  label="eggs collected"
                  icon="📅"
                  variant="compact"
                />
                <StatCard
                  title="This Week"
                  total={thisWeekTotal.toString()}
                  label="eggs collected"
                  icon="📊"
                  variant="compact"
                />
              </div>
              
              {yearProgress > 0 && formData.yearlyEggGoal > yearProgress && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-500 text-lg">🎯</span>
                  <div>
                    <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Keep Going!</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      You need {(formData.yearlyEggGoal - yearProgress).toLocaleString()} more eggs to reach your annual goal.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <FormButton
            variant="primary"
            size="lg"
            onClick={handleProfileSave}
            loading={loading.goal}
            fullWidth
            type="button"
          >
            💾 Save Preferences
          </FormButton>
        </div>
      </FormCard>

      {/* Backfill History Section - Only show if user has egg entries */}
      {eggEntries.length > 0 && (
        <FormCard 
          title="Historical Data" 
          subtitle="Import historical egg tracking data"
          icon="📊"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-600 text-lg">💡</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Backfill Historical Data</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Add egg production data for dates before you started using ChickenCare. This helps create more accurate analytics and trends.
                </p>
              </div>
            </div>

            <FormButton
              variant="secondary"
              size="lg"
              onClick={() => setShowHistoricalModal(true)}
              fullWidth={false}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span>Import Historical Data</span>
              </span>
            </FormButton>
          </div>
        </FormCard>
      )}
    </motion.div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'billing':
        return renderBillingTab();
      case 'goals':
        return renderGoalsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <PageContainer>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        items={[
          { label: 'Dashboard', href: '/' },
          { label: 'Account Settings', current: true }
        ]} 
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Account Settings</h1>
        <p className="text-lg text-gray-600">Manage your personal information, security, and preferences</p>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card success-state"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <span className="text-green-700">{successMessage}</span>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Content */}
      <div className="w-full max-w-2xl mx-auto px-0 sm:px-4">
        {renderActiveTabContent()}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="Continue"
        cancelText="Cancel"
      />

      <HistoricalEggTrackingModal
        isOpen={showHistoricalModal}
        onClose={() => setShowHistoricalModal(false)}
        onSuccess={() => {
          setShowHistoricalModal(false);
        }}
        userTier={userTier}
        addEntry={addEntry}
      />
    </PageContainer>
  );
};