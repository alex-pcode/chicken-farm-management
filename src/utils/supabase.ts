import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yckjarujczxrlaftfjbv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja2phcnVqY3p4cmxhZnRmamJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDkxMDIsImV4cCI6MjA2NDcyNTEwMn0.Q399p6ORsh7-HF4IRLQAJYzgxKk5C3MNCqEIrPA00l4'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types for TypeScript support
export interface FlockProfile {
  id?: string
  farm_name: string
  location: string
  flock_size: number
  breed: string
  start_date: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface EggEntry {
  id?: string
  date: string
  count: number
  created_at?: string
}

export interface FeedInventoryItem {
  id?: string
  name: string
  quantity: number
  unit: string
  cost_per_unit?: number
  purchase_date?: string
  expiry_date?: string
  created_at?: string
  updated_at?: string
}

export interface Expense {
  id?: string
  date: string
  category: string
  description: string
  amount: number
  created_at?: string
}
