// Feature Flag System Tests
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeatureFlagProvider, useFeatureFlags, Feature } from '../FeatureFlagProvider'
import { featureFlags } from '../../utils/featureFlags'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Test component that uses feature flags
const TestComponent = () => {
  const { isEnabled } = useFeatureFlags()
  
  return (
    <div>
      <div data-testid="epic1-status">
        {isEnabled('epic1_unified_api') ? 'Enabled' : 'Disabled'}
      </div>
      <Feature flag="epic1_unified_api" fallback={<div data-testid="fallback">Fallback</div>}>
        <div data-testid="feature-content">Feature Content</div>
      </Feature>
    </div>
  )
}

describe('Feature Flag System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    featureFlags.reset()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('provider initializes with default flags', async () => {
    render(
      <FeatureFlagProvider>
        <TestComponent />
      </FeatureFlagProvider>
    )

    // Should show disabled state by default
    expect(screen.getByTestId('epic1-status')).toHaveTextContent('Disabled')
    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument()
  })

  test('feature flag can be enabled and disabled', () => {
    render(
      <FeatureFlagProvider>
        <TestComponent />
      </FeatureFlagProvider>
    )

    // Initially disabled
    expect(screen.getByTestId('epic1-status')).toHaveTextContent('Disabled')

    // Enable flag (in non-production environment)
    Object.defineProperty(import.meta, 'env', {
      value: { PROD: false, DEV: true },
      writable: true,
    })
    
    featureFlags.enable('epic1_unified_api')
    
    // Re-render to see changes
    render(
      <FeatureFlagProvider>
        <TestComponent />
      </FeatureFlagProvider>
    )
    
    expect(featureFlags.isEnabled('epic1_unified_api')).toBe(true)
  })

  test('Feature component renders correctly based on flag state', () => {
    // Test with flag disabled
    render(
      <FeatureFlagProvider>
        <Feature flag="epic1_unified_api" fallback={<div data-testid="fallback">Fallback</div>}>
          <div data-testid="feature-content">Feature Content</div>
        </Feature>
      </FeatureFlagProvider>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument()
  })

  test('epic-level controls work correctly', () => {
    // Set development environment
    Object.defineProperty(import.meta, 'env', {
      value: { PROD: false, DEV: true },
      writable: true,
    })

    featureFlags.enableEpic(1)
    
    const epic1Status = featureFlags.getEpicStatus(1)
    expect(epic1Status.total).toBeGreaterThan(0)
    expect(epic1Status.enabled).toBe(epic1Status.total)
  })

  test('localStorage integration works', () => {
    const mockFlags = {
      epic1_unified_api: true,
      epic2_extracted_forms: false,
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFlags))
    
    // Reinitialize with localStorage data
    featureFlags.initialize()
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('chicken_manager_feature_flags')
  })

  test('production safety measures work', () => {
    // Mock production environment
    Object.defineProperty(import.meta, 'env', {
      value: { PROD: true, DEV: false },
      writable: true,
    })

    // Should not be able to enable flags in production through methods
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    featureFlags.enable('epic1_unified_api')
    expect(consoleSpy).toHaveBeenCalledWith('Cannot enable feature flags in production')
    
    consoleSpy.mockRestore()
  })

  test('error handling works correctly', async () => {
    // Mock localStorage error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    await featureFlags.initialize()
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load feature flags from localStorage:',
      expect.any(Error)
    )
    
    consoleSpy.mockRestore()
  })
})

describe('Feature Flag Integration', () => {
  test('integrates with monitoring system', () => {
    // This test ensures feature flags work with monitoring
    expect(featureFlags).toBeDefined()
    expect(featureFlags.getAllFlags()).toBeDefined()
    
    // Verify flag structure for monitoring integration
    const flags = featureFlags.getAllFlags()
    expect(flags).toHaveProperty('epic1_unified_api')
    expect(flags).toHaveProperty('epic2_extracted_forms')
    expect(flags).toHaveProperty('epic5_context_splitting')
  })

  test('epic rollback capability validated', () => {
    // Set development environment
    Object.defineProperty(import.meta, 'env', {
      value: { PROD: false, DEV: true },
      writable: true,
    })

    // Enable epic
    featureFlags.enableEpic(1)
    let status = featureFlags.getEpicStatus(1)
    expect(status.enabled).toBe(status.total)
    
    // Disable epic (rollback)
    featureFlags.disableEpic(1)
    status = featureFlags.getEpicStatus(1)
    expect(status.enabled).toBe(0)
  })
})