// Database and application types

// Basic types used in components
export interface EggEntry {
  id?: string;
  date: string;
  count: number;
  created_at?: string;
}

export interface Expense {
  id?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  created_at?: string;
}

export interface FlockEvent {
  id: string;
  date: string;
  type: 'acquisition' | 'laying_start' | 'broody' | 'hatching' | 'other';
  description: string;
  affectedBirds?: number;
  notes?: string;
}

// Database types
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

// Application types
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

export interface FeedEntry {
  id: string;
  brand: string;
  type: string;
  quantity: number;
  unit: 'kg' | 'lbs';
  openedDate: string;
  depletedDate?: string;
  batchNumber?: string;
  pricePerUnit: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper type for test data
export interface TestData {
  eggEntries: EggEntry[];
  chickenExpenses: Expense[];
  flockProfile: FlockProfile;
  feedInventory: FeedEntry[];
}
