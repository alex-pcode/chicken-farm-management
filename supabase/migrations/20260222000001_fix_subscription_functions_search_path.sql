-- Fix: set explicit search_path on subscription functions to resolve security linter warnings.
-- Both functions were originally created in 20250110_001_subscription_schema.sql without
-- SET search_path, leaving them vulnerable to schema-shadowing attacks.

CREATE OR REPLACE FUNCTION public.user_is_premium(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
        RETURN FALSE;
END;
$$;

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
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_user_id IS NULL OR p_subscription_status IS NULL THEN
        RETURN FALSE;
    END IF;

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
        RETURN FALSE;
END;
$$;
