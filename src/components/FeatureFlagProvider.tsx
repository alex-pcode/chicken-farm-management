// Feature Flag Provider for React Context
import React, { useEffect, useState, useContext } from 'react'
import { featureFlags, type FeatureFlags } from '../utils/featureFlags'
import { withEpicMonitoring } from '../utils/monitoring'
import { FeatureFlagContext, type FeatureFlagContextType } from '../contexts/FeatureFlagContext'

interface FeatureFlagProviderProps {
  children: React.ReactNode
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(featureFlags.getAllFlags())
  const [loading, setLoading] = useState(true)
  const monitor = withEpicMonitoring('feature-flags', 'FeatureFlagProvider')

  useEffect(() => {
    const initializeFlags = async () => {
      try {
        await featureFlags.initialize()
        setFlags(featureFlags.getAllFlags())
      } catch (error) {
        monitor.trackError(error as Error, 'lifecycle')
        console.error('Failed to initialize feature flags:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeFlags()
  }, [monitor])

  const isEnabled = (flag: keyof FeatureFlags): boolean => {
    return featureFlags.isEnabled(flag)
  }

  const contextValue: FeatureFlagContextType = {
    flags,
    isEnabled,
    loading,
  }

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

// Feature Flag component for conditional rendering
interface FeatureProps {
  flag: keyof FeatureFlags
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const Feature: React.FC<FeatureProps> = ({ flag, children, fallback = null }) => {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('Feature must be used within FeatureFlagProvider')
  }
  
  return context.isEnabled(flag) ? <>{children}</> : <>{fallback}</>
}

// Epic-specific feature components
export const Epic1Feature: React.FC<Omit<FeatureProps, 'flag'> & { feature: 'unified_api' | 'consolidated_auth' | 'typed_api_methods' }> = ({ feature, ...props }) => (
  <Feature flag={`epic1_${feature}` as keyof FeatureFlags} {...props} />
)

export const Epic2Feature: React.FC<Omit<FeatureProps, 'flag'> & { feature: 'extracted_forms' | 'custom_hooks' | 'shared_ui_components' }> = ({ feature, ...props }) => (
  <Feature flag={`epic2_${feature}` as keyof FeatureFlags} {...props} />
)

export const Epic3Feature: React.FC<Omit<FeatureProps, 'flag'> & { feature: 'consolidated_types' | 'type_guards' | 'api_interfaces' }> = ({ feature, ...props }) => (
  <Feature flag={`epic3_${feature}` as keyof FeatureFlags} {...props} />
)

export const Epic4Feature: React.FC<Omit<FeatureProps, 'flag'> & { feature: 'design_system' | 'form_components' | 'layout_components' }> = ({ feature, ...props }) => (
  <Feature flag={`epic4_${feature}` as keyof FeatureFlags} {...props} />
)

export const Epic5Feature: React.FC<Omit<FeatureProps, 'flag'> & { feature: 'context_splitting' | 'memoization' | 'data_fetching_optimization' }> = ({ feature, ...props }) => (
  <Feature flag={`epic5_${feature}` as keyof FeatureFlags} {...props} />
)

export const Epic6Feature: React.FC<Omit<FeatureProps, 'flag'> & { feature: 'feature_modules' | 'ui_separation' | 'import_updates' }> = ({ feature, ...props }) => (
  <Feature flag={`epic6_${feature}` as keyof FeatureFlags} {...props} />
)

// Development utilities component
export const FeatureFlagDebugPanel: React.FC = () => {
  if (import.meta.env.PROD) {
    return null
  }

  const epics = [1, 2, 3, 4, 5, 6] as const
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="text-sm font-bold mb-2">🚩 Feature Flags</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {epics.map(epic => {
          const epicStatus = featureFlags.getEpicStatus(epic)
          return (
            <div key={epic} className="text-xs">
              <div className="font-semibold">
                Epic {epic}: {epicStatus.enabled}/{epicStatus.total}
              </div>
              <div className="ml-2">
                {Object.entries(epicStatus.flags).map(([flag, enabled]) => (
                  <div key={flag} className={enabled ? 'text-green-400' : 'text-red-400'}>
                    {flag.replace(`epic${epic}_`, '')}: {enabled ? '✓' : '✗'}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => featureFlags.reset()}
        className="mt-2 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
      >
        Reset All
      </button>
    </div>
  )
}