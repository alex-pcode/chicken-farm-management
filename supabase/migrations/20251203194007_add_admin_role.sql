-- Add admin role to user_profiles
-- This allows for admin users who can access Cards and other admin-only features

-- Add is_admin column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN is_admin boolean DEFAULT false NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.user_profiles.is_admin IS 'Determines if user has admin privileges for accessing Cards and other admin-only features';

-- Create index for faster admin checks
CREATE INDEX idx_user_profiles_is_admin ON public.user_profiles(is_admin) WHERE is_admin = true;
