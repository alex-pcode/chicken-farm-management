# Database Schema

```sql
-- Extend existing users table with subscription fields
ALTER TABLE public.users 
ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due', 'paused')),
ADD COLUMN subscription_id VARCHAR(255),
ADD COLUMN customer_id VARCHAR(255), 
ADD COLUMN billing_email VARCHAR(255),
ADD COLUMN subscription_start_date TIMESTAMPTZ,
ADD COLUMN subscription_end_date TIMESTAMPTZ,
ADD COLUMN plan_id VARCHAR(255),
ADD COLUMN subscription_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for subscription status queries
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_users_subscription_id ON public.users(subscription_id) WHERE subscription_id IS NOT NULL;

-- Webhook event logging table
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    payload JSONB NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'success' CHECK (processing_status IN ('success', 'failed', 'retrying')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for webhook event queries
CREATE INDEX idx_webhook_events_webhook_id ON public.webhook_events(webhook_id);
CREATE INDEX idx_webhook_events_user_id ON public.webhook_events(user_id);
CREATE INDEX idx_webhook_events_created_at ON public.webhook_events(created_at);

-- Feature configuration table
CREATE TABLE public.subscription_features (
    feature_key VARCHAR(100) PRIMARY KEY,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    requires_premium BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial feature configurations
INSERT INTO public.subscription_features (feature_key, feature_name, description, requires_premium) VALUES
('crm', 'Customer Relationship Management', 'Customer database and sales tracking', true),
('advanced_analytics', 'Advanced Analytics', 'Detailed reporting and insights', true),
('expense_tracking', 'Expense Management', 'Comprehensive expense tracking and categorization', true),
('feed_management', 'Feed Management', 'Feed inventory and consumption tracking', true),
('savings_calculator', 'Savings Calculator', 'Financial planning tools', true),
('data_export', 'Data Export', 'Export data to CSV/PDF formats', true),
('egg_counter', 'Basic Egg Tracking', 'Core egg production tracking', false);

-- Update existing RLS policies to include subscription checks

-- Example: Update flock_profiles RLS policy
DROP POLICY IF EXISTS "Users can only access their own flock profiles" ON public.flock_profiles;
CREATE POLICY "Users can only access their own flock profiles" ON public.flock_profiles
    FOR ALL USING (
        auth.uid() = user_id AND (
            -- Free users get basic access
            (SELECT subscription_status FROM public.users WHERE id = auth.uid()) = 'free'
            OR 
            -- Premium users get full access  
            (SELECT subscription_status FROM public.users WHERE id = auth.uid()) IN ('active')
        )
    );

-- Example: CRM features require premium subscription
-- Assuming you have a customers table for CRM
DROP POLICY IF EXISTS "Users can access customer data" ON public.customers;
CREATE POLICY "Premium users can access customer data" ON public.customers
    FOR ALL USING (
        auth.uid() = user_id AND 
        (SELECT subscription_status FROM public.users WHERE id = auth.uid()) = 'active'
    );

-- Example: Expense tracking requires premium
DROP POLICY IF EXISTS "Users can access their expenses" ON public.expenses;
CREATE POLICY "Premium users can access expense data" ON public.expenses
    FOR ALL USING (
        auth.uid() = user_id AND 
        (SELECT subscription_status FROM public.users WHERE id = auth.uid()) = 'active'
    );

-- Egg entries remain free for all users (no policy change needed)
-- Existing policy: "Users can only access their own egg entries" remains unchanged

-- Enable RLS on new tables
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "Webhook events are private" ON public.webhook_events
    FOR SELECT USING (false); -- Only accessible via service role

CREATE POLICY "Feature configuration is readable by all authenticated users" ON public.subscription_features
    FOR SELECT USING (auth.role() = 'authenticated');

-- Function to check premium status (for complex queries)
CREATE OR REPLACE FUNCTION public.user_is_premium(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT subscription_status = 'active' 
        FROM public.users 
        WHERE id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription status (used by webhook handler)
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
    UPDATE public.users SET
        subscription_status = p_subscription_status,
        subscription_id = COALESCE(p_subscription_id, subscription_id),
        customer_id = COALESCE(p_customer_id, customer_id),
        billing_email = COALESCE(p_billing_email, billing_email),
        subscription_start_date = COALESCE(p_subscription_start_date, subscription_start_date),
        subscription_end_date = p_subscription_end_date,
        plan_id = COALESCE(p_plan_id, plan_id),
        subscription_updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration for existing users: set all to 'free' status
UPDATE public.users SET 
    subscription_status = 'free',
    subscription_updated_at = NOW()
WHERE subscription_status IS NULL;

-- Performance optimization: Add partial indexes for premium queries
CREATE INDEX idx_users_active_subscriptions ON public.users(id) 
    WHERE subscription_status = 'active';

-- Add constraints for data integrity
ALTER TABLE public.users ADD CONSTRAINT chk_subscription_dates 
    CHECK (subscription_end_date IS NULL OR subscription_end_date > subscription_start_date);
```
