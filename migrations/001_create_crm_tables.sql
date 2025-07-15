-- CRM Migration: Create customers and sales tables
-- Run this in your Supabase SQL Editor

-- Create customers table with user_id isolation
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create sales table with user_id isolation
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  sale_date DATE NOT NULL,
  dozen_count INTEGER DEFAULT 0 CHECK (dozen_count >= 0),
  individual_count INTEGER DEFAULT 0 CHECK (individual_count >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_paid ON sales(paid);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view own customers" ON customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON customers FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sales table
CREATE POLICY "Users can view own sales" ON sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales" ON sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales" ON sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales" ON sales FOR DELETE USING (auth.uid() = user_id);
