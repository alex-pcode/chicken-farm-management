export interface EggEntry {
  date: string;
  count: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface FlockEvent {
  id: string;
  date: string;
  type: 'acquisition' | 'laying_start' | 'broody' | 'hatching' | 'other';
  description: string;
  affectedBirds?: number;
  notes?: string;
}

export interface FlockProfile {
  hens: number;
  roosters: number;
  chicks: number;
  lastUpdated: string;
  breedTypes: string[];
  flockStartDate?: string;
  events: FlockEvent[];
  brooding: number;
  notes?: string;
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
}

export interface TestData {
  eggEntries: EggEntry[];
  chickenExpenses: Expense[];
  flockProfile: FlockProfile;
  feedInventory: FeedEntry[];
}