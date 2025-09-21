/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OptimizedDataProvider, useUserTier, useUserProfile } from '../OptimizedDataProvider';
import { apiService } from '../../services/api';
import type { UserProfile } from '../../types';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    data: {
      fetchAllData: vi.fn()
    }
  }
}));

// Mock browser cache
vi.mock('../../utils/browserCache', () => ({
  browserCache: {
    get: vi.fn(),
    set: vi.fn()
  },
  CACHE_KEYS: {
    APP_DATA: 'app_data'
  }
}));

const mockApiService = vi.mocked(apiService);

describe('OptimizedDataProvider Tier Functionality', () => {
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <OptimizedDataProvider>{children}</OptimizedDataProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserTier hook', () => {
    it('should return "free" when user profile is null', async () => {
      (mockApiService.data.fetchAllData as any).mockResolvedValue({
        data: {
          eggEntries: [],
          expenses: [],
          feedInventory: [],
          flockProfile: null,
          flockEvents: [],
          customers: [],
          sales: [],
          summary: undefined,
          flockBatches: [],
          deathRecords: [],
          userProfile: null
        }
      });

      const { result } = renderHook(() => useUserTier(), {
        wrapper: createWrapper()
      });

      // Wait for initial data fetch
      await vi.waitFor(() => {
        expect(result.current.userTier).toBe('free');
      });
    });

    it('should return "free" when subscription_status is undefined', async () => {
      const mockUserProfile: Partial<UserProfile> = {
        id: '1',
        user_id: 'user-1',
        onboarding_completed: true,
        onboarding_step: 'complete',
        setup_progress: {
          hasFlockProfile: false,
          hasRecordedProduction: false,
          hasRecordedExpense: false,
          hasFeedTracking: false,
          hasCustomer: false,
          hasSale: false,
          hasMultipleBatches: false,
        },
        subscription_status: 'free',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      } as UserProfile;

      (mockApiService.data.fetchAllData as any).mockResolvedValue({
        data: {
          eggEntries: [],
          expenses: [],
          feedInventory: [],
          flockProfile: null,
          flockEvents: [],
          customers: [],
          sales: [],
          summary: undefined,
          flockBatches: [],
          deathRecords: [],
          userProfile: mockUserProfile as UserProfile
        }
      });

      const { result } = renderHook(() => useUserTier(), {
        wrapper: createWrapper()
      });

      await vi.waitFor(() => {
        expect(result.current.userTier).toBe('free');
      });
    });

    it('should return "free" when subscription_status is "free"', async () => {
      const mockUserProfile: UserProfile = {
        id: '1',
        user_id: 'user-1',
        onboarding_completed: true,
        onboarding_step: 'complete',
        setup_progress: {
          hasFlockProfile: false,
          hasRecordedProduction: false,
          hasRecordedExpense: false,
          hasFeedTracking: false,
          hasCustomer: false,
          hasSale: false,
          hasMultipleBatches: false,
        },
        subscription_status: 'free',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      (mockApiService.data.fetchAllData as any).mockResolvedValue({
        data: {
          eggEntries: [],
          expenses: [],
          feedInventory: [],
          flockProfile: null,
          flockEvents: [],
          customers: [],
          sales: [],
          summary: undefined,
          flockBatches: [],
          deathRecords: [],
          userProfile: mockUserProfile
        }
      });

      const { result } = renderHook(() => useUserTier(), {
        wrapper: createWrapper()
      });

      await vi.waitFor(() => {
        expect(result.current.userTier).toBe('free');
      });
    });

    it('should return "premium" when subscription_status is "active"', async () => {
      const mockUserProfile: UserProfile = {
        id: '1',
        user_id: 'user-1',
        onboarding_completed: true,
        onboarding_step: 'complete',
        setup_progress: {
          hasFlockProfile: false,
          hasRecordedProduction: false,
          hasRecordedExpense: false,
          hasFeedTracking: false,
          hasCustomer: false,
          hasSale: false,
          hasMultipleBatches: false,
        },
        subscription_status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      (mockApiService.data.fetchAllData as any).mockResolvedValue({
        data: {
          eggEntries: [],
          expenses: [],
          feedInventory: [],
          flockProfile: null,
          flockEvents: [],
          customers: [],
          sales: [],
          summary: undefined,
          flockBatches: [],
          deathRecords: [],
          userProfile: mockUserProfile
        }
      });

      const { result } = renderHook(() => useUserTier(), {
        wrapper: createWrapper()
      });

      await vi.waitFor(() => {
        expect(result.current.userTier).toBe('premium');
      });
    });
  });

  describe('useUserProfile hook', () => {
    it('should return user profile data including subscription status', async () => {
      const mockUserProfile: UserProfile = {
        id: '1',
        user_id: 'user-1',
        onboarding_completed: true,
        onboarding_step: 'complete',
        setup_progress: {
          hasFlockProfile: true,
          hasRecordedProduction: true,
          hasRecordedExpense: true,
          hasFeedTracking: true,
          hasCustomer: true,
          hasSale: true,
          hasMultipleBatches: true,
        },
        subscription_status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      (mockApiService.data.fetchAllData as any).mockResolvedValue({
        data: {
          eggEntries: [],
          expenses: [],
          feedInventory: [],
          flockProfile: null,
          flockEvents: [],
          customers: [],
          sales: [],
          summary: undefined,
          flockBatches: [],
          deathRecords: [],
          userProfile: mockUserProfile
        }
      });

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper()
      });

      await vi.waitFor(() => {
        expect(result.current).toEqual(mockUserProfile);
      });
    });

    it('should return null when no user profile exists', async () => {
      (mockApiService.data.fetchAllData as any).mockResolvedValue({
        data: {
          eggEntries: [],
          expenses: [],
          feedInventory: [],
          flockProfile: null,
          flockEvents: [],
          customers: [],
          sales: [],
          summary: undefined,
          flockBatches: [],
          deathRecords: [],
          userProfile: null
        }
      });

      const { result } = renderHook(() => useUserProfile(), {
        wrapper: createWrapper()
      });

      await vi.waitFor(() => {
        expect(result.current).toBeNull();
      });
    });
  });
});
