-- SQL to create tables for Chicken Farm Management App
-- Run this in Supabase SQL Editor

-- Create flock_profiles table
CREATE TABLE IF NOT EXISTS flock_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  flock_size INTEGER NOT NULL,
  breed VARCHAR(255),
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create egg_entries table
CREATE TABLE IF NOT EXISTS egg_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date) -- Ensure only one entry per date
);

-- Create feed_inventory table
CREATE TABLE IF NOT EXISTS feed_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(50) NOT NULL,
  cost_per_unit DECIMAL(10,2),
  purchase_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_egg_entries_date ON egg_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_expiry ON feed_inventory(expiry_date);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE flock_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (you can make this more restrictive later)
CREATE POLICY "Allow all operations on flock_profiles" ON flock_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on egg_entries" ON egg_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on feed_inventory" ON feed_inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true);
