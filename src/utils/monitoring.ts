// Production monitoring utilities for refactoring safety
import * as Sentry from "@sentry/react"

// Performance monitoring for refactoring impact
export const measurePerformance = (name: string) => {
  return Sentry.startSpan({ name }, (span) => {
    return {
      finish: () => span?.end(),
      addData: (key: string, value: string | number | boolean | undefined) => span?.setAttributes({ [key]: value }),
    }
  })
}

// API error monitoring
export const trackAPIError = (error: Error, context: {
  endpoint?: string
  method?: string
  epic?: string
  component?: string
}) => {
  Sentry.captureException(error, {
    tags: {
      error_type: 'api_error',
      refactoring_epic: context.epic,
      component: context.component,
    },
    extra: {
      endpoint: context.endpoint,
      method: context.method,
    },
  })
}

// Component refactoring monitoring
export const trackComponentError = (error: Error, context: {
  componentName: string
  epic: string
  errorType: 'render' | 'lifecycle' | 'event_handler'
}) => {
  Sentry.captureException(error, {
    tags: {
      error_type: 'component_error',
      refactoring_epic: context.epic,
      component_name: context.componentName,
      component_error_type: context.errorType,
    },
  })
}

// State management error monitoring  
export const trackStateError = (error: Error, context: {
  contextName: string
  operation: string
  epic: string
}) => {
  Sentry.captureException(error, {
    tags: {
      error_type: 'state_error',
      refactoring_epic: context.epic,
      context_name: context.contextName,
      state_operation: context.operation,
    },
  })
}

// User experience monitoring for refactoring impact
export const trackUserExperienceIssue = (issue: {
  type: 'slow_render' | 'broken_feature' | 'data_loss' | 'navigation_issue'
  description: string
  component?: string
  epic?: string
}) => {
  Sentry.captureMessage(`UX Issue: ${issue.type}`, {
    level: 'warning',
    tags: {
      issue_type: 'ux_degradation',
      refactoring_epic: issue.epic,
      component: issue.component,
      ux_issue_type: issue.type,
    },
    extra: {
      description: issue.description,
    },
  })
}

// Performance regression monitoring
export const trackPerformanceRegression = (metric: {
  name: string
  value: number
  baseline: number
  threshold: number
  component?: string
  epic?: string
}) => {
  const regression = ((metric.value - metric.baseline) / metric.baseline) * 100
  
  if (regression > metric.threshold) {
    Sentry.captureMessage(`Performance Regression: ${metric.name}`, {
      level: 'warning',
      tags: {
        issue_type: 'performance_regression',
        refactoring_epic: metric.epic,
        component: metric.component,
        metric_name: metric.name,
      },
      extra: {
        current_value: metric.value,
        baseline_value: metric.baseline,
        regression_percentage: regression,
        threshold: metric.threshold,
      },
    })
  }
}

// Web Vitals monitoring for user experience impact
export const initializeWebVitalsMonitoring = () => {
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      const sendVitalToSentry = (metric: { name: string; value: number; rating?: string }) => {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: metric.name,
          level: 'info',
          data: {
            value: metric.value,
            rating: metric.rating,
          },
        })

        // Alert on poor Web Vitals that might indicate refactoring issues
        if (metric.rating === 'poor') {
          trackUserExperienceIssue({
            type: 'slow_render',
            description: `Poor ${metric.name}: ${metric.value}`,
            epic: 'monitoring',
          })
        }
      }

      onCLS(sendVitalToSentry)
      onINP(sendVitalToSentry)  // INP replaced FID in web-vitals v3+
      onFCP(sendVitalToSentry)
      onLCP(sendVitalToSentry)
      onTTFB(sendVitalToSentry)
    }).catch(console.warn)
  }
}

// Epic-specific monitoring context
export const withEpicMonitoring = (epic: string, component: string) => {
  return {
    trackError: (error: Error, errorType: 'render' | 'lifecycle' | 'event_handler' = 'render') => 
      trackComponentError(error, { componentName: component, epic, errorType }),
    
    trackAPI: (error: Error, endpoint?: string, method?: string) =>
      trackAPIError(error, { endpoint, method, epic, component }),
    
    trackState: (error: Error, contextName: string, operation: string) =>
      trackStateError(error, { contextName, operation, epic }),
    
    measurePerf: (name: string) => measurePerformance(`${epic}.${component}.${name}`),
  }
}

// Development helper for testing monitoring
export const testMonitoring = () => {
  if (import.meta.env.DEV) {
    console.log('Testing monitoring setup...')
    
    // Test error capture
    trackComponentError(new Error('Test monitoring error'), {
      componentName: 'TestComponent',
      epic: 'test',
      errorType: 'render',
    })
    
    console.log('Monitoring test completed - check Sentry dashboard')
  }
}