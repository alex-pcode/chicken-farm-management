import { createClient } from '@supabase/supabase-js'

// Require environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration:')
  console.log('URL:', supabaseUrl)
  console.log('Key (first 20 chars):', supabaseKey.substring(0, 20) + '...')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types are now centralized in src/types/index.ts
import type { FlockProfile, EggEntry, FeedEntry, Expense } from '../types';

// Toggle: Use localStorage for development/testing instead of Supabase
export const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

export function isLocalStorageMode() {
  return USE_LOCAL_STORAGE;
}
