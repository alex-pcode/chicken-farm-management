/**
 * User Service - Handles user profiles and onboarding state
 */

import { BaseApiService } from './BaseApiService';
import type { 
  ApiResponse, 
  UserProfile,
  FarmSetupProgress,
  OnboardingFormData 
} from '../../types';

export class UserService extends BaseApiService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Get current user's profile and onboarding state
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile | null>> {
    try {
      const response = await this.get<{ userProfile: UserProfile | null }>('/data');

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.userProfile || null
        };
      }

      return response as unknown as ApiResponse<UserProfile | null>;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return {
        success: false,
        error: { message: 'Failed to get user profile', code: 'USER_PROFILE_ERROR' }
      };
    }
  }

  /**
   * Update user profile and onboarding state
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    try {
      // Validation
      if (profile.onboarding_step && !['welcome', 'setup', 'complete'].includes(profile.onboarding_step)) {
        return {
          success: false,
          error: { message: 'Invalid onboarding step', code: 'VALIDATION_ERROR' }
        };
      }

      const response = await this.post<{ profile: UserProfile }>('/crud?operation=userProfile', { profile });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.profile
        };
      }

      return response as unknown as ApiResponse<UserProfile>;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return {
        success: false,
        error: { message: 'Failed to update user profile', code: 'USER_PROFILE_UPDATE_ERROR' }
      };
    }
  }

  /**
   * Complete onboarding wizard with flock creation
   */
  async completeOnboarding(formData: OnboardingFormData): Promise<ApiResponse<{ profile: UserProfile; flockCreated: boolean }>> {
    try {
      // Validation
      const validationErrors: string[] = [];
      
      if (formData.hasChickens) {
        if (formData.henCount < 0 || formData.roosterCount < 0 || formData.chickCount < 0) {
          validationErrors.push('Bird counts cannot be negative');
        }
        
        if (!formData.breed.trim()) {
          validationErrors.push('Breed is required when you have chickens');
        }
        
        if (!formData.acquisitionDate) {
          validationErrors.push('Acquisition date is required when you have chickens');
        }
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          error: { message: validationErrors.join(', '), code: 'VALIDATION_ERROR' }
        };
      }

      const response = await this.post<{ profile: UserProfile; flockCreated: boolean }>('/crud?operation=completeOnboarding', { formData });

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            profile: response.data.profile,
            flockCreated: response.data.flockCreated
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      return {
        success: false,
        error: { message: 'Failed to complete onboarding', code: 'ONBOARDING_ERROR' }
      };
    }
  }

  /**
   * Calculate current setup progress based on user data (client-side)
   */
  calculateSetupProgress(progress: FarmSetupProgress): { progress: FarmSetupProgress; percentage: number } {
    let percentage = 0;
    if (progress.hasFlockProfile) percentage += 40;
    if (progress.hasRecordedProduction) percentage += 20;
    if (progress.hasRecordedExpense) percentage += 10;
    if (progress.hasCustomer) percentage += 5;
    if (progress.hasSale) percentage += 10;
    if (progress.hasMultipleBatches) percentage += 5;
    if (progress.hasFeedTracking) percentage += 10;

    return { progress, percentage };
  }

  /**
   * Update a specific progress flag
   */
  async updateProgressFlag(flag: keyof FarmSetupProgress, value: boolean): Promise<ApiResponse<UserProfile>> {
    try {
      const profileResponse = await this.getUserProfile();
      if (!profileResponse.success || !profileResponse.data) {
        return {
          success: false,
          error: { message: 'Could not load user profile', code: 'USER_PROFILE_LOAD_ERROR' }
        };
      }

      const updatedProgress = {
        ...profileResponse.data.setup_progress,
        [flag]: value
      };

      return this.updateUserProfile({
        setup_progress: updatedProgress
      });
    } catch (error) {
      console.error('Failed to update progress flag:', error);
      return {
        success: false,
        error: { message: 'Failed to update progress flag', code: 'PROGRESS_UPDATE_ERROR' }
      };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getUserProfile();
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.onboarding_completed
        };
      }

      // If no profile exists, user hasn't completed onboarding
      return {
        success: true,
        data: false
      };
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return {
        success: false,
        error: { message: 'Failed to check onboarding status', code: 'ONBOARDING_STATUS_ERROR' }
      };
    }
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboardingFlow(): Promise<ApiResponse<UserProfile>> {
    return this.updateUserProfile({
      onboarding_completed: true,
      onboarding_step: 'complete'
    });
  }
}