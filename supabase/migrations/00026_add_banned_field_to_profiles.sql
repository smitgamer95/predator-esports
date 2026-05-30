-- Add banned field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_banned ON public.profiles(banned);

-- Add comment
COMMENT ON COLUMN public.profiles.banned IS 'Whether the user is banned from the platform';