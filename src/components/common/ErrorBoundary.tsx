// Error Boundary for production error handling and monitoring
import React from 'react'
import * as Sentry from "@sentry/react"
import { ApiError, ApiServiceError, AuthenticationError, NetworkError, ApiValidationError, ServerError } from '../../types/api'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Categorize error for better handling
    const errorCategory = this.categorizeError(error);
    
    // Send to Sentry with enhanced context
    Sentry.captureException(error, {
      tags: {
        component: 'ErrorBoundary',
        refactoring_risk: 'critical',
        error_category: errorCategory,
        error_type: error.constructor.name,
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        validation: errorCategory === 'validation' ? {
          isValidationError: true,
          errorDetails: this.getValidationErrorDetails(error),
        } : undefined,
      },
    })

    this.setState({
      error,
      errorInfo,
    })
  }

  private categorizeError = (error: Error): string => {
    if (error instanceof ApiValidationError) return 'validation';
    if (error instanceof AuthenticationError) return 'authentication';
    if (error instanceof NetworkError) return 'network';
    if (error instanceof ServerError) return 'server';
    if (error instanceof ApiError || error instanceof ApiServiceError) return 'api';
    return 'unknown';
  }

  private getValidationErrorDetails = (error: Error) => {
    if (error instanceof ApiServiceError) {
      return {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      };
    }
    return null;
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error} 
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Enhanced error fallback component with validation error handling
const DefaultErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const getErrorMessage = (error?: Error): { title: string; message: string; isRetryable: boolean } => {
    if (!error) {
      return {
        title: 'Oops! Something went wrong',
        message: "We've been notified of this issue and are working to fix it.",
        isRetryable: true
      };
    }

    if (error instanceof ApiValidationError) {
      return {
        title: 'Data Validation Error',
        message: 'The data provided was invalid. Please check your input and try again.',
        isRetryable: true
      };
    }

    if (error instanceof AuthenticationError) {
      return {
        title: 'Authentication Required',
        message: 'Please refresh the page or log in again to continue.',
        isRetryable: false
      };
    }

    if (error instanceof NetworkError) {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        isRetryable: true
      };
    }

    if (error instanceof ServerError) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again in a few moments.',
        isRetryable: true
      };
    }

    if (error instanceof ApiError || error instanceof ApiServiceError) {
      return {
        title: 'Service Unavailable',
        message: error.message || 'A service error occurred. Please try again.',
        isRetryable: true
      };
    }

    return {
      title: 'Unexpected Error',
      message: "We've been notified of this issue and are working to fix it.",
      isRetryable: true
    };
  };

  const { title, message, isRetryable } = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
          
          {/* Additional details for API errors */}
          {error instanceof ApiServiceError && error.details && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error.details}</p>
            </div>
          )}
          
          {/* Development error details */}
          {import.meta.env.DEV && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs text-red-600 overflow-x-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {error.toString()}
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="mt-6 space-y-3">
            {isRetryable && (
              <button
                onClick={resetError}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/'}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {error instanceof AuthenticationError ? 'Refresh & Login' : 'Go Home'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for Sentry error boundary
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  {
    fallback: ({ error, resetError }) => (
      <DefaultErrorFallback error={error as Error} resetError={resetError} />
    ),
    beforeCapture: (scope) => {
      scope.setTag('component', 'SentryErrorBoundary')
      scope.setTag('refactoring_context', 'production')
    },
  }
)

export default ErrorBoundary