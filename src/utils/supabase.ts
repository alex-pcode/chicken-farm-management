import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmohmazolvilxpxhfjie.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttb2htYXpvbHZpbHhweGhmamllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNzUsImV4cCI6MjA2NDgwOTE3NX0.b-biGmoVFvMW9vF6YN2fomyh3kzEGdhQCZ69jdmH7G8'

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
