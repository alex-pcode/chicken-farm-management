-- Fix: set explicit search_path on handle_new_user to resolve security linter warning
-- Without SET search_path the function inherits the caller's search_path at runtime,
-- which allows object-shadowing attacks and unpredictable name resolution.
--
-- This migration:
--   1. Re-creates the handle_new_user trigger function with SET search_path = public
--   2. Re-creates the on_auth_user_created trigger (idempotent)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;

-- Re-create the trigger so it is guaranteed to point at the updated function.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
