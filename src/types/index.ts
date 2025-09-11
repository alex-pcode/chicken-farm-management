/**
 * Consolidated Type Definitions
 * 
 * This module provides centralized access to all application types through
 * a clean barrel export pattern with logical domain organization.
 */

/* ===== FORM AND VALIDATION TYPES ===== */

/**
 * Form validation error interface used throughout the application
 * for client-side form validation and error display
 */
export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'range';
}

/* ===== CORE APPLICATION DATA TYPES ===== */

/**
 * Daily egg production entry record
 */
export interface EggEntry {
  id: string;
  date: string;
  count: number;
  size?: 'small' | 'medium' | 'large' | 'extra-large' | 'jumbo';
  color?: 'white' | 'brown' | 'blue' | 'green' | 'speckled' | 'cream';
  notes?: string;
  created_at?: string;
}

/**
 * Expense record for financial tracking
 */
export interface Expense {
  id?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  created_at?: string;
}

/* ===== FLOCK MANAGEMENT TYPES ===== */

/**
 * Historical event record for flock tracking
 */
export interface FlockEvent {
  id: string;
  date: string;
  type: 'acquisition' | 'laying_start' | 'broody' | 'hatching' | 'other';
  description: string;
  affectedBirds?: number;
  notes?: string;
}

/**
 * Batch tracking for organized flock management
 */
export interface FlockBatch {
  id: string;
  batchName: string;
  breed: string;
  acquisitionDate: string;
  initialCount: number;
  currentCount: number;
  type: 'hens' | 'roosters' | 'chicks' | 'mixed';
  ageAtAcquisition: 'chick' | 'juvenile' | 'adult';
  expectedLayingStartDate?: string;
  actualLayingStartDate?: string;
  source: string; // hatchery, farm, store, etc.
  cost?: number; // cost paid for acquiring this batch (0.00 if free)
  notes?: string;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
  hensCount?: number;
  roostersCount?: number;
  chicksCount?: number;
  broodingCount?: number;
}

/**
 * Mortality tracking record for batch management
 */
export interface DeathRecord {
  id: string;
  batchId: string;
  date: string;
  count: number; // number of birds that died
  cause: 'predator' | 'disease' | 'age' | 'injury' | 'unknown' | 'culled' | 'other';
  description: string;
  notes?: string;
  created_at?: string;
}

/**
 * Batch-specific event tracking
 */
export interface BatchEvent {
  id: string;
  batchId: string;
  date: string;
  type: 'health_check' | 'vaccination' | 'relocation' | 'breeding' | 'laying_start' | 'brooding_start' | 'brooding_stop' | 'production_note' | 'flock_added' | 'flock_loss' | 'other';
  description: string;
  affectedCount?: number;
  notes?: string;
  created_at?: string;
}

/* ===== SUMMARY AND ANALYTICS TYPES ===== */

/**
 * Comprehensive flock analytics and summary data
 */
export interface FlockSummary {
  totalBirds: number;
  totalHens: number;
  totalRoosters: number;
  totalChicks: number;
  totalBrooding: number;
  activeBatches: number;
  expectedLayers: number; // hens that should be laying
  actualLayers?: number; // based on recent egg production
  avgEggsPerHen?: number;
  totalDeaths: number;
  mortalityRate: number;
  
  // Additional insights
  productionMetrics: {
    avgDailyEggs: number;
    productionStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
    productionMessage: string;
    layingReady: number;
    tooYoung: number;
    brooding: number;
  };
  
  mortalityMetrics: {
    recentDeaths: number;
    last30Days: number;
    overallRate: number;
  };
  
  batchSummary: Array<{
    id: string;
    name: string;
    breed: string;
    type: string;
    currentCount: number;
    acquisitionDate: string;
    ageAtAcquisition: 'chick' | 'juvenile' | 'adult';
    isLayingAge: boolean;
  }>;
}

/* ===== DATABASE AND PROFILE TYPES ===== */

/**
 * Database schema representation of flock profile
 */
export interface DBFlockProfile {
  id?: string;
  farm_name: string;
  location: string;
  flock_size: number;
  breed: string;
  start_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Application-level flock profile with computed fields
 */
export interface FlockProfile {
  id?: string;
  hens: number;
  roosters: number;
  chicks: number;
  lastUpdated: string;
  breedTypes: string[];
  flockStartDate?: string;
  events: FlockEvent[];
  brooding: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/* ===== FEED AND INVENTORY TYPES ===== */

/**
 * Feed inventory tracking record
 */
export interface FeedEntry {
  id: string;
  brand: string;
  type: string;
  quantity: number;
  unit: 'kg' | 'lbs';
  openedDate: string;
  depletedDate?: string;
  batchNumber?: string;
  total_cost: number;
  pricePerUnit?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/* ===== BARREL EXPORTS ===== */

/**
 * API response and error handling types
 */
export * from './api';

/**
 * Customer relationship management types
 */
export * from './crm';
export type { Customer, Sale, SaleWithCustomer, SalesSummary } from './crm';

/**
 * Service interface definitions
 */
export * from './services';

/* ===== ONBOARDING TYPES ===== */

/**
 * User onboarding state and progress tracking
 */
export interface FarmSetupProgress {
  hasFlockProfile: boolean;      // 50 points - Completed onboarding
  hasRecordedProduction: boolean; // 30 points - Logged ≥1 egg entry
  hasRecordedExpense: boolean;    // 20 points - Logged ≥1 expense  
  hasFeedTracking: boolean;       // 20 points - Logged feed data
  hasCustomer: boolean;           // 10 points - Added ≥1 customer
  hasSale: boolean;               // 10 points - Recorded ≥1 sale
  hasMultipleBatches: boolean;    // 5 points - Multiple flock batches
}

/**
 * User onboarding profile information
 */
export interface UserProfile {
  id: string;
  user_id: string;
  onboarding_completed: boolean;
  onboarding_step: 'welcome' | 'setup' | 'complete';
  setup_progress: FarmSetupProgress;
  subscription_status: 'free' | 'active' | 'cancelled' | 'past_due' | 'paused';
  created_at: string;
  updated_at: string;
}

/**
 * Onboarding context state
 */
export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: 'welcome' | 'setup' | 'complete';
  setupProgress: FarmSetupProgress;
  lastActiveDate: string;
  showGuidance: boolean;
}

/**
 * Onboarding wizard form data
 */
export interface OnboardingFormData {
  hasChickens: boolean;
  henCount: number;
  roosterCount: number;
  chickCount: number;
  broodingCount?: number;
  breed: string;
  acquisitionDate: string;
  batchName?: string;
  ageAtAcquisition?: 'chick' | 'juvenile' | 'adult';
  source?: string;
  cost?: number;
  notes?: string;
}

/* ===== UTILITY AND TEST TYPES ===== */

/**
 * Complete application data structure returned by fetchAllData API
 * Import types directly to avoid barrel export issues
 */
import type { Customer, SaleWithCustomer, SalesSummary } from './crm';

export interface AppData {
  eggEntries: EggEntry[];
  expenses: Expense[];
  feedInventory: FeedEntry[];
  flockProfile: FlockProfile | null;
  flockEvents?: FlockEvent[];
  flockBatches?: FlockBatch[];
  deathRecords?: DeathRecord[];
  customers?: Customer[];
  sales?: SaleWithCustomer[];
  summary?: SalesSummary;
  userProfile?: UserProfile | null;
}

/**
 * Helper type for test data consolidation
 */
export interface TestData {
  eggEntries: EggEntry[];
  chickenExpenses: Expense[];
  flockProfile: FlockProfile;
  feedInventory: FeedEntry[];
}

