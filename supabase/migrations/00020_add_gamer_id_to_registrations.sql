-- Add gamer_id field to tournament_registrations
ALTER TABLE public.tournament_registrations
ADD COLUMN IF NOT EXISTS gamer_id TEXT;

-- Create index for gamer_id
CREATE INDEX IF NOT EXISTS idx_registrations_gamer_id ON public.tournament_registrations(gamer_id);