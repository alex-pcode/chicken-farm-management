-- Migration: Implement Subscription Database Schema
-- Story: 16.1.implement-subscription-database-schema
-- Date: 2025-01-10
-- Description: Extends users table and creates subscription-related tables for LemonSqueezy integration

-- ================================
-- TASK 1: Extend users table with subscription fields
-- ================================

-- Add subscription-related columns to existing users table
-- NOTE: Using user_profiles table instead of users as per Supabase architecture
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active'
    CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due', 'paused')),
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_id VARCHAR(255), 
ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for subscription status and subscription_id fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON public.user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id ON public.user_profiles(subscription_id) 
    WHERE subscription_id IS NOT NULL;

-- ================================
-- TASK 2: Create webhook_events table
-- ================================

-- Create webhook_events table for audit trail and idempotency tracking
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'success' 
        CHECK (processing_status IN ('success', 'failed', 'retrying')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for webhook event queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON public.webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON public.webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);

-- ================================
-- TASK 3: Create subscription_features table
-- ================================

-- Create subscription_features table for configurable feature gating
CREATE TABLE IF NOT EXISTS public.subscription_features (
    feature_key VARCHAR(100) PRIMARY KEY,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    requires_premium BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial feature configurations
INSERT INTO public.subscription_features (feature_key, feature_name, description, requires_premium) 
VALUES
    ('crm', 'Customer Relationship Management', 'Customer database and sales tracking', true),
    ('advanced_analytics', 'Advanced Analytics', 'Detailed reporting and insights', true),
    ('expense_tracking', 'Expense Management', 'Comprehensive expense tracking and categorization', true),
    ('feed_management', 'Feed Management', 'Feed inventory and consumption tracking', true),
    ('savings_calculator', 'Savings Calculator', 'Financial planning tools', true),
    ('data_export', 'Data Export', 'Export data to CSV/PDF formats', true),
    ('egg_counter', 'Basic Egg Tracking', 'Core egg production tracking', false)
ON CONFLICT (feature_key) DO NOTHING;

-- ================================
-- TASK 4: Create database functions
-- ================================

-- Create user_is_premium helper function for complex queries
CREATE OR REPLACE FUNCTION public.user_is_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate input parameter
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN (
        SELECT subscription_status = 'active' 
        FROM public.user_profiles 
        WHERE user_id = user_uuid
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Handle any errors gracefully
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update_user_subscription function for webhook processing
CREATE OR REPLACE FUNCTION public.update_user_subscription(
    p_user_id UUID,
    p_subscription_status VARCHAR,
    p_subscription_id VARCHAR DEFAULT NULL,
    p_customer_id VARCHAR DEFAULT NULL,
    p_billing_email VARCHAR DEFAULT NULL,
    p_subscription_start_date TIMESTAMPTZ DEFAULT NULL,
    p_subscription_end_date TIMESTAMPTZ DEFAULT NULL,
    p_plan_id VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Validate required parameters
    IF p_user_id IS NULL OR p_subscription_status IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Validate subscription_status value
    IF p_subscription_status NOT IN ('free', 'active', 'cancelled', 'past_due', 'paused') THEN
        RETURN FALSE;
    END IF;

    UPDATE public.user_profiles SET
        subscription_status = p_subscription_status,
        subscription_id = COALESCE(p_subscription_id, subscription_id),
        customer_id = COALESCE(p_customer_id, customer_id),
        billing_email = COALESCE(p_billing_email, billing_email),
        subscription_start_date = COALESCE(p_subscription_start_date, subscription_start_date),
        subscription_end_date = p_subscription_end_date,
        plan_id = COALESCE(p_plan_id, plan_id),
        subscription_updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        -- Handle errors gracefully
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- TASK 5: Add performance indexes
-- ================================

-- Create partial index for active subscriptions only
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_subscriptions ON public.user_profiles(user_id) 
    WHERE subscription_status = 'active';

-- Create composite indexes for webhook event queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_status ON public.webhook_events(user_id, processing_status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type_created ON public.webhook_events(event_type, created_at);

-- Add constraint indexes for data integrity checks
ALTER TABLE public.user_profiles ADD CONSTRAINT IF NOT EXISTS chk_subscription_dates 
    CHECK (subscription_end_date IS NULL OR subscription_end_date > subscription_start_date);

-- ================================
-- TASK 6: Secure new tables with RLS
-- ================================

-- Enable RLS on webhook_events table (service role only access)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on subscription_features table (authenticated read access)
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for webhook_events (service role only access)
DROP POLICY IF EXISTS "Webhook events are service role only" ON public.webhook_events;
CREATE POLICY "Webhook events are service role only" ON public.webhook_events
    FOR ALL USING (false); -- Only accessible via service role

-- Create RLS policy for subscription_features (authenticated read access)
DROP POLICY IF EXISTS "Feature configuration readable by authenticated users" ON public.subscription_features;
CREATE POLICY "Feature configuration readable by authenticated users" ON public.subscription_features
    FOR SELECT USING (auth.role() = 'authenticated');

-- ================================
-- DATA MIGRATION AND CLEANUP
-- ================================

-- Migration for existing users: set all to 'active' status if not already set
UPDATE public.user_profiles SET
    subscription_status = 'active',
    subscription_updated_at = NOW()
WHERE subscription_status IS NULL;

-- ================================
-- VERIFICATION COMMENTS
-- ================================

-- This migration accomplishes:
-- ✅ AC1: Users table extended with subscription-related fields without breaking existing functionality
-- ✅ AC2: WebhookEvent table created for audit trail and idempotency tracking  
-- ✅ AC3: SubscriptionFeature table created for configurable feature gating
-- ✅ AC4: Database functions created for subscription status updates and validation
-- ✅ AC5: Proper indexes added for subscription queries performance
-- ✅ AC6: All existing RLS policies preserved and new tables secured

-- Next steps after running this migration:
-- 1. Update existing RLS policies for premium feature gating (separate migration)
-- 2. Test subscription status checks don't break existing queries
-- 3. Verify webhook processing functions work correctly
-- 4. Test feature access control in frontend components