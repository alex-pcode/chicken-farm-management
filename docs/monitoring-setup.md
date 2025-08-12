# Production Monitoring Setup Guide

## Overview

This document provides setup instructions for production error monitoring and performance tracking during the Chicken Manager structural refactoring process.

## Sentry Integration

### Required Environment Variables

Add these to your production environment (Vercel):

```env
# Sentry Configuration (Production Only)
VITE_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Local Development

Sentry is **disabled in development** by default. To test monitoring in development:

1. Set `VITE_SENTRY_DSN` in your `.env.local`
2. Run `npm run dev` 
3. Use `testMonitoring()` function in browser console

## Monitoring Features

### 1. Error Monitoring

**Automatic Error Capture**:
- React component errors via Error Boundary
- Unhandled JavaScript exceptions  
- API errors with context
- State management errors

**Refactoring-Specific Tagging**:
- Errors tagged by Epic (1-6)
- Component-specific error tracking
- High-risk error pattern detection

### 2. Performance Monitoring

**Web Vitals Tracking**:
- Core Web Vitals (CLS, FID, LCP)
- First Contentful Paint (FCP)
- Time to First Byte (TTFB)

**Refactoring Impact Detection**:
- Performance regression alerts
- Component render time tracking
- API response time monitoring

### 3. User Experience Monitoring

**UX Issue Detection**:
- Slow render detection
- Broken feature identification  
- Data loss prevention
- Navigation issue tracking

## Usage During Refactoring

### Epic 1: API Layer Consolidation

```typescript
import { withEpicMonitoring } from '../utils/monitoring'

const monitor = withEpicMonitoring('epic1', 'ApiService')

try {
  await apiCall()
} catch (error) {
  monitor.trackAPI(error, '/api/getData', 'GET')
  throw error
}
```

### Epic 2: Component Size Reduction

```typescript
import { withEpicMonitoring } from '../utils/monitoring'

const ProfileComponent = () => {
  const monitor = withEpicMonitoring('epic2', 'Profile')
  
  try {
    // Component logic
  } catch (error) {
    monitor.trackError(error, 'render')
    throw error
  }
}
```

### Epic 5: State Management Optimization

```typescript
import { withEpicMonitoring } from '../utils/monitoring'

const useDataContext = () => {
  const monitor = withEpicMonitoring('epic5', 'DataContext')
  
  try {
    // State logic
  } catch (error) {
    monitor.trackState(error, 'DataContext', 'updateState')
    throw error
  }
}
```

## Dashboard Setup

### Sentry Project Configuration

1. **Create Project**: Name it "chicken-manager-refactoring"
2. **Set Alerts**: Configure alerts for refactoring-specific tags
3. **Create Dashboard**: Monitor epic-specific metrics

### Key Metrics to Monitor

**Error Rates**:
- Overall error rate baseline
- Epic-specific error increases
- Component error patterns

**Performance Impact**:
- Page load time changes
- Component render performance
- API response time degradation

**User Experience**:
- Feature functionality preservation
- Navigation flow integrity
- Data consistency maintenance

## Alert Configuration

### Critical Alerts (Immediate Response)

- **High-Risk Refactoring Errors**: Errors tagged with `refactoring_risk: high`
- **Production Crashes**: Unhandled exceptions in production
- **Data Loss Issues**: Errors in data persistence operations

### Warning Alerts (Daily Review)

- **Performance Regressions**: Web Vitals degradation >20%
- **Component Error Increases**: Error rate increases in refactored components
- **UX Degradation**: User experience issue reports

## Best Practices

### Development Phase

1. **Test Monitoring Locally**: Use `testMonitoring()` function
2. **Component Wrapper**: Wrap new components with error boundaries
3. **API Error Handling**: Use monitoring utilities for all API calls

### Production Deployment

1. **Gradual Rollout**: Deploy one epic at a time
2. **Monitor Baselines**: Establish performance baselines before refactoring
3. **Rollback Triggers**: Define clear error rate thresholds for rollback

### Epic Implementation

1. **Pre-Epic Monitoring**: Set baseline metrics before starting epic
2. **During Epic**: Monitor real-time for immediate issues
3. **Post-Epic Review**: Analyze impact and adjust for next epic

## Troubleshooting

### Common Issues

**Monitoring Not Working**:
- Check environment variables are set in production
- Verify Sentry DSN is correct
- Confirm error boundary is wrapping components

**High Error Rates**:
- Review recent refactoring changes
- Check component error patterns
- Verify API integration stability

**Performance Degradation**:
- Analyze Web Vitals trends
- Check component render optimization
- Review state management changes

## Integration with Testing

The monitoring system works alongside our Vitest testing infrastructure:

- **Unit Tests**: Prevent errors before deployment
- **Monitoring**: Detect issues in production
- **Combined**: Comprehensive safety net for refactoring

## Next Steps

1. ✅ **Set up Sentry account** and configure environment variables
2. ✅ **Deploy monitoring** with next production release
3. ✅ **Establish baselines** before starting Epic 1
4. ✅ **Configure alerts** for refactoring-specific issues

---

**Generated with [Claude Code](https://claude.ai/code)**  
**Co-Authored-By:** Claude <noreply@anthropic.com>