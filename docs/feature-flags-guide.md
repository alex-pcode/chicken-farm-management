# Feature Flags Guide for Refactoring Safety

## Overview

This guide explains how to use feature flags for granular rollback capabilities during the Chicken Manager structural refactoring process. Feature flags enable safe, incremental deployment of Epic changes with immediate rollback capability.

## Feature Flag Structure

### Epic-Based Organization

Each Epic has dedicated feature flags for its major components:

**Epic 1: API Layer Consolidation**
- `epic1_unified_api` - Enable unified API service layer
- `epic1_consolidated_auth` - Enable consolidated authentication
- `epic1_typed_api_methods` - Enable type-safe API methods

**Epic 2: Component Size Reduction**
- `epic2_extracted_forms` - Enable extracted form components  
- `epic2_custom_hooks` - Enable custom data management hooks
- `epic2_shared_ui_components` - Enable shared UI components

**Epic 3: Type System Consistency**
- `epic3_consolidated_types` - Enable consolidated type definitions
- `epic3_type_guards` - Enable runtime type validation
- `epic3_api_interfaces` - Enable type-safe API interfaces

**Epic 4: Shared UI Components**
- `epic4_design_system` - Enable design system foundation
- `epic4_form_components` - Enable shared form components
- `epic4_layout_components` - Enable shared layout components

**Epic 5: State Management Optimization**
- `epic5_context_splitting` - Enable domain-specific contexts
- `epic5_memoization` - Enable state normalization and memoization
- `epic5_data_fetching_optimization` - Enable optimized data fetching

**Epic 6: File Organization**
- `epic6_feature_modules` - Enable feature-based module structure
- `epic6_ui_separation` - Enable UI/business logic separation
- `epic6_import_updates` - Enable updated import paths

## Usage Patterns

### Component-Level Feature Flags

```typescript
import { Feature, Epic2Feature } from '../components/FeatureFlagProvider'

const ProfileComponent = () => {
  return (
    <div>
      {/* Original implementation */}
      <Feature flag="epic2_extracted_forms" fallback={<OriginalForm />}>
        <NewExtractedForm />
      </Feature>
      
      {/* Epic-specific shorthand */}
      <Epic2Feature feature="custom_hooks" fallback={<OriginalHooks />}>
        <NewCustomHooks />
      </Epic2Feature>
    </div>
  )
}
```

### API Layer Feature Flags

```typescript
import { useFeatureFlags } from '../components/FeatureFlagProvider'
import { withEpicMonitoring } from '../utils/monitoring'

const useDataApi = () => {
  const { isEnabled } = useFeatureFlags()
  const monitor = withEpicMonitoring('epic1', 'DataApi')
  
  const fetchData = async () => {
    if (isEnabled('epic1_unified_api')) {
      try {
        return await newUnifiedApi.fetchData()
      } catch (error) {
        monitor.trackAPI(error as Error, '/api/unified', 'GET')
        // Fallback to old API
        return await oldApi.fetchData()
      }
    }
    
    return await oldApi.fetchData()
  }
  
  return { fetchData }
}
```

### State Management Feature Flags

```typescript
import { useFeatureFlags } from '../components/FeatureFlagProvider'

const DataProvider = ({ children }) => {
  const { isEnabled } = useFeatureFlags()
  
  if (isEnabled('epic5_context_splitting')) {
    return (
      <FlockContextProvider>
        <CRMContextProvider>
          <FinancialContextProvider>
            {children}
          </FinancialContextProvider>
        </CRMContextProvider>
      </FlockContextProvider>
    )
  }
  
  // Fallback to original single context
  return (
    <OriginalDataProvider>
      {children}
    </OriginalDataProvider>
  )
}
```

## Configuration Methods

### Production (Environment Variables)

Set in Vercel environment variables:

```env
# Enable Epic 1 features
VITE_FEATURE_EPIC1_UNIFIED_API=true
VITE_FEATURE_EPIC1_CONSOLIDATED_AUTH=false
VITE_FEATURE_EPIC1_TYPED_API_METHODS=true

# Enable Epic 2 features
VITE_FEATURE_EPIC2_EXTRACTED_FORMS=true
VITE_FEATURE_EPIC2_CUSTOM_HOOKS=false
VITE_FEATURE_EPIC2_SHARED_UI_COMPONENTS=false
```

### Development (Browser Console)

```javascript
// Enable individual flags
featureFlags.enable('epic1_unified_api')
featureFlags.disable('epic1_unified_api')

// Enable entire epic
featureFlags.enableEpic(1)
featureFlags.disableEpic(1)

// Check epic status
featureFlags.getEpicStatus(1)
// Returns: { enabled: 2, total: 3, flags: {...} }

// Reset all flags
featureFlags.reset()

// View all flags
featureFlags.getAllFlags()
```

### Development Debug Panel

Add to your app during development:

```typescript
import { FeatureFlagDebugPanel } from '../components/FeatureFlagProvider'

const App = () => {
  return (
    <div>
      {/* Your app content */}
      <FeatureFlagDebugPanel />
    </div>
  )
}
```

## Rollback Strategies

### Immediate Rollback (Production Issues)

**Scenario**: Epic 1 API consolidation causing errors in production

1. **Environment Variable Update**:
   ```env
   VITE_FEATURE_EPIC1_UNIFIED_API=false
   VITE_FEATURE_EPIC1_CONSOLIDATED_AUTH=false
   VITE_FEATURE_EPIC1_TYPED_API_METHODS=false
   ```

2. **Redeploy**: Trigger Vercel redeploy (usually <2 minutes)

3. **Monitor**: Check Sentry dashboard for error reduction

### Partial Rollback (Specific Feature Issues)

**Scenario**: Epic 2 custom hooks working, but extracted forms have issues

1. **Selective Disable**:
   ```env
   VITE_FEATURE_EPIC2_EXTRACTED_FORMS=false
   VITE_FEATURE_EPIC2_CUSTOM_HOOKS=true
   VITE_FEATURE_EPIC2_SHARED_UI_COMPONENTS=false
   ```

2. **Monitor**: Verify specific feature is disabled, others remain

### Epic-Level Rollback

**Scenario**: Epic 5 state management changes causing performance issues

1. **Epic Disable**:
   ```env
   VITE_FEATURE_EPIC5_CONTEXT_SPLITTING=false
   VITE_FEATURE_EPIC5_MEMOIZATION=false
   VITE_FEATURE_EPIC5_DATA_FETCHING_OPTIMIZATION=false
   ```

2. **Alternative**: Use single environment variable for epic control (future enhancement)

## Integration with Monitoring

### Feature Flag Error Tracking

```typescript
import { withFeatureFlag } from '../utils/featureFlags'
import { withEpicMonitoring } from '../utils/monitoring'

const EnhancedComponent = withFeatureFlag(
  'epic2_extracted_forms',
  () => {
    const monitor = withEpicMonitoring('epic2', 'EnhancedComponent')
    
    try {
      return <NewComponent />
    } catch (error) {
      monitor.trackError(error as Error, 'render')
      throw error
    }
  },
  OriginalComponent // Fallback
)
```

### Performance Impact Monitoring

```typescript
const FeatureWithPerformanceTracking = () => {
  const { isEnabled } = useFeatureFlags()
  const monitor = withEpicMonitoring('epic5', 'StateOptimizedComponent')
  
  if (isEnabled('epic5_memoization')) {
    const perf = monitor.measurePerf('memoized-render')
    
    // New optimized implementation
    const result = <OptimizedComponent />
    
    perf.finish()
    return result
  }
  
  return <OriginalComponent />
}
```

## Best Practices

### Implementation Phase

1. **Feature Flag First**: Implement feature flags BEFORE refactoring
2. **Gradual Rollout**: Enable one flag at a time in production
3. **Monitoring Integration**: Always combine with error monitoring
4. **Fallback Testing**: Test fallback scenarios thoroughly

### Epic Deployment Strategy

1. **Epic 1**: Start with `epic1_typed_api_methods` (lowest risk)
2. **Validate**: Monitor for 24-48 hours before next flag
3. **Progress**: Enable `epic1_consolidated_auth`, then `epic1_unified_api`
4. **Complete**: Move to Epic 2 only after Epic 1 is fully stable

### Error Handling

1. **Graceful Degradation**: Always provide functional fallbacks
2. **Error Boundaries**: Wrap feature-flagged components
3. **Monitoring Tags**: Tag feature flag errors for easy identification
4. **Quick Rollback**: Have rollback procedures ready

### Development Workflow

1. **Local Development**: Use browser console to toggle flags
2. **Testing**: Test both enabled and disabled states
3. **PR Reviews**: Ensure fallback implementations work
4. **Staging**: Test feature flag toggles before production

## Emergency Procedures

### Complete System Rollback

If all refactoring changes need immediate rollback:

```bash
# Set all feature flags to false
VITE_FEATURE_EPIC1_UNIFIED_API=false
VITE_FEATURE_EPIC1_CONSOLIDATED_AUTH=false
VITE_FEATURE_EPIC1_TYPED_API_METHODS=false
VITE_FEATURE_EPIC2_EXTRACTED_FORMS=false
# ... (all other flags false)
```

### Database Rollback (If Needed)

Feature flags primarily affect application code, not database schema. However:

1. **Data Migration Issues**: Use database migration rollback scripts
2. **API Changes**: Feature flags handle API compatibility
3. **State Structure**: Context changes are isolated by feature flags

## Testing Feature Flags

### Unit Tests

```typescript
// Test both enabled and disabled states
describe('FeatureComponent', () => {
  test('renders new component when flag enabled', () => {
    vi.mocked(useFeatureFlag).mockReturnValue(true)
    render(<FeatureComponent />)
    expect(screen.getByTestId('new-component')).toBeInTheDocument()
  })
  
  test('renders fallback when flag disabled', () => {
    vi.mocked(useFeatureFlag).mockReturnValue(false)
    render(<FeatureComponent />)
    expect(screen.getByTestId('fallback-component')).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// Test epic-level functionality
describe('Epic 1 Integration', () => {
  test('API consolidation works with unified flag', async () => {
    // Enable unified API flag
    featureFlags.enable('epic1_unified_api')
    
    // Test API calls use new implementation
    const result = await fetchData()
    expect(result).toBeDefined()
  })
})
```

## Future Enhancements

1. **Remote Configuration**: External service for flag management
2. **User-Based Flags**: Different flags for different user groups
3. **Automatic Rollback**: Error threshold triggers automatic flag disable
4. **A/B Testing**: Statistical comparison of old vs new implementations

---

**Generated with [Claude Code](https://claude.ai/code)**  
**Co-Authored-By:** Claude <noreply@anthropic.com>