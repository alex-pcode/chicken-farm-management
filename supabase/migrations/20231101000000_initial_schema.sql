-- Initial schema for ChickenCare application
-- Generated from production Supabase instance

-- ============================================
-- TABLES
-- ============================================

-- Egg entries table
CREATE TABLE IF NOT EXISTS public.egg_entries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    count integer NOT NULL CHECK (count >= 0),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id),
    size text CHECK (size = ANY (ARRAY['small', 'medium', 'large', 'extra-large', 'jumbo'])),
    color text CHECK (color = ANY (ARRAY['white', 'brown', 'blue', 'green', 'speckled', 'cream'])),
    notes text
);

COMMENT ON COLUMN public.egg_entries.size IS 'Egg size classification: small (42.5g), medium (49.6g), large (56.8g), extra-large (63.8g), jumbo (70.9g)';
COMMENT ON COLUMN public.egg_entries.color IS 'Egg shell color classification';
COMMENT ON COLUMN public.egg_entries.notes IS 'Optional notes about the egg entry';

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    category character varying NOT NULL,
    description text,
    amount numeric NOT NULL CHECK (amount >= 0),
    created_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Feed inventory table
CREATE TABLE IF NOT EXISTS public.feed_inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    quantity numeric NOT NULL CHECK (quantity >= 0),
    unit character varying NOT NULL,
    total_cost numeric,
    purchase_date date,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

COMMENT ON COLUMN public.feed_inventory.total_cost IS 'Total cost for the entire feed bag/purchase';

-- Flock profiles table
CREATE TABLE IF NOT EXISTS public.flock_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_name character varying NOT NULL,
    location character varying,
    flock_size integer NOT NULL,
    breed character varying,
    start_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    hens integer DEFAULT 0,
    roosters integer DEFAULT 0,
    chicks integer DEFAULT 0,
    brooding integer DEFAULT 0,
    user_id uuid REFERENCES auth.users(id)
);

-- Flock events table
CREATE TABLE IF NOT EXISTS public.flock_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    flock_profile_id uuid REFERENCES public.flock_profiles(id),
    date date NOT NULL,
    type character varying NOT NULL CHECK (type = ANY (ARRAY['acquisition', 'laying_start', 'broody', 'hatching', 'other'])),
    description text NOT NULL,
    affected_birds integer,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    name text NOT NULL,
    phone text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);

-- Sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    customer_id uuid REFERENCES public.customers(id),
    sale_date date NOT NULL,
    dozen_count integer DEFAULT 0 CHECK (dozen_count >= 0),
    individual_count integer DEFAULT 0 CHECK (individual_count >= 0),
    total_amount numeric NOT NULL CHECK (total_amount >= 0),
    paid boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Flock batches table
CREATE TABLE IF NOT EXISTS public.flock_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    batch_name character varying NOT NULL,
    breed character varying NOT NULL,
    acquisition_date date NOT NULL,
    initial_count integer NOT NULL CHECK (initial_count > 0),
    current_count integer NOT NULL CHECK (current_count >= 0),
    type character varying NOT NULL CHECK (type = ANY (ARRAY['hens', 'roosters', 'chicks', 'mixed'])),
    age_at_acquisition character varying NOT NULL CHECK (age_at_acquisition = ANY (ARRAY['chick', 'juvenile', 'adult'])),
    expected_laying_start_date date,
    actual_laying_start_date date,
    source character varying NOT NULL,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    hens_count integer DEFAULT 0,
    roosters_count integer DEFAULT 0,
    chicks_count integer DEFAULT 0,
    cost numeric DEFAULT 0.00,
    brooding_count integer DEFAULT 0 CHECK (brooding_count >= 0)
);

COMMENT ON COLUMN public.flock_batches.hens_count IS 'Number of female adult chickens in this batch';
COMMENT ON COLUMN public.flock_batches.roosters_count IS 'Number of male adult chickens in this batch';
COMMENT ON COLUMN public.flock_batches.chicks_count IS 'Number of young chickens (gender not determined) in this batch';
COMMENT ON COLUMN public.flock_batches.cost IS 'Cost paid for acquiring this batch (0.00 if free)';
COMMENT ON COLUMN public.flock_batches.brooding_count IS 'Number of brooding hens in this batch';

-- Death records table
CREATE TABLE IF NOT EXISTS public.death_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    batch_id uuid NOT NULL REFERENCES public.flock_batches(id),
    date date NOT NULL,
    count integer NOT NULL CHECK (count > 0),
    cause character varying NOT NULL CHECK (cause = ANY (ARRAY['predator', 'disease', 'age', 'injury', 'unknown', 'culled', 'other'])),
    description text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    bird_type text CHECK (bird_type = ANY (ARRAY['hen', 'rooster', 'chick', 'brooding']))
);

-- Batch events table
CREATE TABLE IF NOT EXISTS public.batch_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    batch_id uuid NOT NULL REFERENCES public.flock_batches(id),
    date date NOT NULL,
    type character varying NOT NULL CHECK (type = ANY (ARRAY['health_check', 'vaccination', 'relocation', 'breeding', 'laying_start', 'brooding_start', 'brooding_stop', 'production_note', 'flock_added', 'flock_loss', 'chickens_hatched', 'other'])),
    description text NOT NULL,
    affected_count integer CHECK (affected_count > 0),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),
    onboarding_completed boolean DEFAULT false,
    onboarding_step character varying,
    setup_progress jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subscription_status character varying DEFAULT 'active' CHECK (subscription_status = ANY (ARRAY['free', 'active', 'cancelled', 'past_due', 'paused'])),
    subscription_id character varying,
    customer_id character varying,
    billing_email character varying,
    subscription_start_date timestamp with time zone,
    subscription_end_date timestamp with time zone,
    plan_id character varying,
    subscription_updated_at timestamp with time zone DEFAULT now()
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_id character varying NOT NULL UNIQUE,
    event_type character varying NOT NULL,
    user_id uuid REFERENCES auth.users(id),
    payload jsonb NOT NULL,
    processing_status character varying DEFAULT 'success' CHECK (processing_status = ANY (ARRAY['success', 'failed', 'retrying'])),
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone DEFAULT now()
);

-- Subscription features table
CREATE TABLE IF NOT EXISTS public.subscription_features (
    feature_key character varying PRIMARY KEY,
    feature_name character varying NOT NULL,
    description text,
    requires_premium boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.egg_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flock_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Egg entries policies
CREATE POLICY "Users can view own egg entries" ON public.egg_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own egg entries" ON public.egg_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own egg entries" ON public.egg_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own egg entries" ON public.egg_entries FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Feed inventory policies
CREATE POLICY "Users can view own feed inventory" ON public.feed_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feed inventory" ON public.feed_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feed inventory" ON public.feed_inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feed inventory" ON public.feed_inventory FOR DELETE USING (auth.uid() = user_id);

-- Flock profiles policies
CREATE POLICY "Users can view own flock profiles" ON public.flock_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flock profiles" ON public.flock_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flock profiles" ON public.flock_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flock profiles" ON public.flock_profiles FOR DELETE USING (auth.uid() = user_id);

-- Flock events policies
CREATE POLICY "Users can view own flock events" ON public.flock_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flock events" ON public.flock_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flock events" ON public.flock_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flock events" ON public.flock_events FOR DELETE USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- Sales policies
CREATE POLICY "Users can view own sales" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales" ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- Flock batches policies
CREATE POLICY "Users can view own flock batches" ON public.flock_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flock batches" ON public.flock_batches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flock batches" ON public.flock_batches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flock batches" ON public.flock_batches FOR DELETE USING (auth.uid() = user_id);

-- Death records policies
CREATE POLICY "Users can view own death records" ON public.death_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own death records" ON public.death_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own death records" ON public.death_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own death records" ON public.death_records FOR DELETE USING (auth.uid() = user_id);

-- Batch events policies
CREATE POLICY "Users can view own batch events" ON public.batch_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own batch events" ON public.batch_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own batch events" ON public.batch_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own batch events" ON public.batch_events FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Webhook events policies (only service role can access)
CREATE POLICY "Service role can manage webhook events" ON public.webhook_events FOR ALL USING (auth.role() = 'service_role');

-- Subscription features policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view subscription features" ON public.subscription_features FOR SELECT USING (auth.role() = 'authenticated');
