import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PremiumFeatureGate } from '../common/PremiumFeatureGate';
import { useUserTier } from '../../contexts/OptimizedDataProvider';

// Mock the OptimizedDataProvider hook
vi.mock('../../contexts/OptimizedDataProvider', () => ({
  useUserTier: vi.fn()
}));

// Mock framer-motion to avoid issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => 
      <div ref={ref} {...props} />
    )
  }
}));

const mockUseUserTier = vi.mocked(useUserTier);

describe('PremiumFeatureGate', () => {
  const mockChildrenContent = 'Premium Content Here';
  const MockChildren = () => <div>{mockChildrenContent}</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user has premium tier', () => {
    beforeEach(() => {
      mockUseUserTier.mockReturnValue({ userTier: 'premium', isSubscriptionLoading: false });
    });

    it('should render children for premium users', () => {
      render(
        <PremiumFeatureGate>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.getByText(mockChildrenContent)).toBeInTheDocument();
    });

    it('should not render upgrade prompt for premium users', () => {
      render(
        <PremiumFeatureGate>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
      expect(screen.queryByText('🚀 Upgrade to Premium')).not.toBeInTheDocument();
    });
  });

  describe('when user has free tier', () => {
    beforeEach(() => {
      mockUseUserTier.mockReturnValue({ userTier: 'free', isSubscriptionLoading: false });
    });

    it('should render upgrade prompt instead of children', () => {
      render(
        <PremiumFeatureGate>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.queryByText(mockChildrenContent)).not.toBeInTheDocument();
      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
      expect(screen.getByText('🚀 Upgrade to Premium')).toBeInTheDocument();
    });

    it('should display default feature name message', () => {
      render(
        <PremiumFeatureGate>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.getByText(/Access to this feature requires/)).toBeInTheDocument();
    });

    it('should display custom feature name in message', () => {
      const customFeatureName = 'Advanced Analytics Dashboard';
      render(
        <PremiumFeatureGate featureName={customFeatureName}>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.getByText(`Access to ${customFeatureName} requires a premium subscription. Upgrade to unlock advanced farm management features.`)).toBeInTheDocument();
    });

    it('should render upgrade button with proper accessibility', () => {
      const featureName = 'Dashboard Analytics';
      render(
        <PremiumFeatureGate featureName={featureName}>
          <MockChildren />
        </PremiumFeatureGate>
      );

      const upgradeButton = screen.getByRole('button', { name: `Upgrade to premium to access ${featureName}` });
      expect(upgradeButton).toBeInTheDocument();
      expect(upgradeButton).toHaveClass('neu-button');
    });

    it('should handle upgrade button click', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <PremiumFeatureGate>
          <MockChildren />
        </PremiumFeatureGate>
      );

      const upgradeButton = screen.getByText('🚀 Upgrade to Premium');
      fireEvent.click(upgradeButton);

      expect(consoleSpy).toHaveBeenCalledWith('Upgrade to Premium clicked - ready for payment integration');
      consoleSpy.mockRestore();
    });

    it('should render fallback content when provided', () => {
      const fallbackText = 'Custom Fallback Content';
      const MockFallback = () => <div>{fallbackText}</div>;

      render(
        <PremiumFeatureGate fallback={<MockFallback />}>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.getByText(fallbackText)).toBeInTheDocument();
      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
      expect(screen.queryByText(mockChildrenContent)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseUserTier.mockReturnValue({ userTier: 'free', isSubscriptionLoading: false });
    });

    it('should have proper ARIA labels and structure', () => {
      render(
        <PremiumFeatureGate featureName="test feature">
          <MockChildren />
        </PremiumFeatureGate>
      );

      const upgradeButton = screen.getByLabelText('Upgrade to premium to access test feature');
      expect(upgradeButton).toBeInTheDocument();
    });

    it('should use semantic HTML structure', () => {
      render(
        <PremiumFeatureGate>
          <MockChildren />
        </PremiumFeatureGate>
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Premium Feature');
    });
  });
});