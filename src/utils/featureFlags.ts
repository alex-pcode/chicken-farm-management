// Feature Flag System for Brownfield Refactoring Safety
// Enables granular rollback capabilities during Epic implementation
import React from 'react'

export interface FeatureFlags {
  // Epic 1: API Layer Consolidation
  epic1_unified_api: boolean
  epic1_consolidated_auth: boolean
  epic1_typed_api_methods: boolean
  
  // Epic 2: Component Size Reduction  
  epic2_extracted_forms: boolean
  epic2_custom_hooks: boolean
  epic2_shared_ui_components: boolean
  
  // Epic 3: Type System Consistency
  epic3_consolidated_types: boolean
  epic3_type_guards: boolean
  epic3_api_interfaces: boolean
  
  // Epic 4: Shared UI Components
  epic4_design_system: boolean
  epic4_form_components: boolean
  epic4_layout_components: boolean
  
  // Epic 5: State Management Optimization
  epic5_context_splitting: boolean
  epic5_memoization: boolean
  epic5_data_fetching_optimization: boolean
  
  // Epic 6: File Organization
  epic6_feature_modules: boolean
  epic6_ui_separation: boolean
  epic6_import_updates: boolean
}

// Default feature flags (all disabled initially for safety)
const DEFAULT_FLAGS: FeatureFlags = {
  // Epic 1 flags
  epic1_unified_api: false,
  epic1_consolidated_auth: false,
  epic1_typed_api_methods: false,
  
  // Epic 2 flags
  epic2_extracted_forms: false,
  epic2_custom_hooks: false,
  epic2_shared_ui_components: false,
  
  // Epic 3 flags
  epic3_consolidated_types: false,
  epic3_type_guards: false,
  epic3_api_interfaces: false,
  
  // Epic 4 flags
  epic4_design_system: false,
  epic4_form_components: false,
  epic4_layout_components: false,
  
  // Epic 5 flags
  epic5_context_splitting: false,
  epic5_memoization: false,
  epic5_data_fetching_optimization: false,
  
  // Epic 6 flags
  epic6_feature_modules: false,
  epic6_ui_separation: false,
  epic6_import_updates: false,
}

// Feature flag sources (priority order)
// type FeatureFlagSource = 
//   | 'environment'     // Environment variables (highest priority)
//   | 'localStorage'    // Local storage (development)
//   | 'remote'          // Remote config (future)
//   | 'default'         // Default values

class FeatureFlagManager {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS }
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Load from environment variables (production)
    this.loadFromEnvironment()
    
    // Load from localStorage (development)
    if (import.meta.env.DEV) {
      this.loadFromLocalStorage()
    }
    
    // Future: Load from remote config service
    // await this.loadFromRemote()
    
    this.initialized = true
    console.log('Feature flags initialized:', this.flags)
  }

  private loadFromEnvironment(): void {
    Object.keys(DEFAULT_FLAGS).forEach(key => {
      const envKey = `VITE_FEATURE_${key.toUpperCase()}`
      const envValue = import.meta.env[envKey]
      
      if (envValue !== undefined) {
        this.flags[key as keyof FeatureFlags] = envValue === 'true'
      }
    })
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('chicken_manager_feature_flags')
      if (stored) {
        const parsedFlags = JSON.parse(stored)
        this.flags = { ...this.flags, ...parsedFlags }
      }
    } catch (error) {
      console.warn('Failed to load feature flags from localStorage:', error)
    }
  }

  // Get feature flag value
  isEnabled(flag: keyof FeatureFlags): boolean {
    if (!this.initialized) {
      console.warn(`Feature flag ${flag} accessed before initialization`)
      return DEFAULT_FLAGS[flag]
    }
    return this.flags[flag]
  }

  // Enable feature flag (development only)
  enable(flag: keyof FeatureFlags): void {
    if (import.meta.env.PROD) {
      console.warn('Cannot enable feature flags in production')
      return
    }
    
    this.flags[flag] = true
    this.saveToLocalStorage()
    console.log(`Feature flag ${flag} enabled`)
  }

  // Disable feature flag (development only)
  disable(flag: keyof FeatureFlags): void {
    if (import.meta.env.PROD) {
      console.warn('Cannot disable feature flags in production')
      return
    }
    
    this.flags[flag] = false
    this.saveToLocalStorage()
    console.log(`Feature flag ${flag} disabled`)
  }

  // Get all flags
  getAllFlags(): FeatureFlags {
    return { ...this.flags }
  }

  // Epic-level controls
  enableEpic(epicNumber: 1 | 2 | 3 | 4 | 5 | 6): void {
    const epicFlags = Object.keys(this.flags).filter(key => 
      key.startsWith(`epic${epicNumber}_`)
    ) as (keyof FeatureFlags)[]
    
    epicFlags.forEach(flag => this.enable(flag))
    console.log(`Epic ${epicNumber} feature flags enabled`)
  }

  disableEpic(epicNumber: 1 | 2 | 3 | 4 | 5 | 6): void {
    const epicFlags = Object.keys(this.flags).filter(key => 
      key.startsWith(`epic${epicNumber}_`)
    ) as (keyof FeatureFlags)[]
    
    epicFlags.forEach(flag => this.disable(flag))
    console.log(`Epic ${epicNumber} feature flags disabled`)
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('chicken_manager_feature_flags', JSON.stringify(this.flags))
    } catch (error) {
      console.warn('Failed to save feature flags to localStorage:', error)
    }
  }

  // Development utilities
  reset(): void {
    if (import.meta.env.PROD) return
    
    this.flags = { ...DEFAULT_FLAGS }
    this.saveToLocalStorage()
    console.log('Feature flags reset to defaults')
  }

  // Get epic status
  getEpicStatus(epicNumber: 1 | 2 | 3 | 4 | 5 | 6): {
    enabled: number
    total: number
    flags: { [key: string]: boolean }
  } {
    const epicFlags = Object.entries(this.flags).filter(([key]) => 
      key.startsWith(`epic${epicNumber}_`)
    )
    
    const enabled = epicFlags.filter(([, value]) => value).length
    const flags = Object.fromEntries(epicFlags)
    
    return {
      enabled,
      total: epicFlags.length,
      flags,
    }
  }
}

// Global feature flag manager instance
export const featureFlags = new FeatureFlagManager()

// React hook for feature flags
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags.isEnabled(flag)
}

// Higher-order component for feature flags
export const withFeatureFlag = <P extends object>(
  flag: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType<P>
) => {
  return (props: P) => {
    const isEnabled = useFeatureFlag(flag)
    
    if (isEnabled) {
      return React.createElement(Component, props)
    }
    
    return Fallback ? React.createElement(Fallback, props) : null
  }
}

// Initialize on module load
featureFlags.initialize()

// Development utilities (available in browser console)
if (import.meta.env.DEV) {
  (window as any).featureFlags = featureFlags
  console.log('Feature flags available in console as window.featureFlags')
}