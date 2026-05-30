-- Fix database RLS policies for external app access
-- This migration ensures all tables have proper public read access where appropriate

-- 1. Enable RLS on payment_settings and add public read policy
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view payment settings"
ON public.payment_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Add public read access to tournament_registrations for external apps
-- This allows other apps to view registration data
CREATE POLICY "Public can view all registrations"
ON public.tournament_registrations
FOR SELECT
TO public
USING (true);

-- 3. Add public read access to admin_settings for external apps
-- Already has public read, but let's ensure it's properly documented

-- Note: This migration maintains security while allowing external apps to read public data
-- Write operations still require proper authentication and admin privileges
