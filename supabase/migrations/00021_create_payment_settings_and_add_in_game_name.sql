-- Create payment_settings table for dynamic UPI
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default payment settings
INSERT INTO public.payment_settings (upi_id, receiver_name)
VALUES ('9409929696@fam', 'Predator E-Sports')
ON CONFLICT DO NOTHING;

-- Add in_game_name field to tournament_registrations
ALTER TABLE public.tournament_registrations
ADD COLUMN IF NOT EXISTS in_game_name TEXT;

-- Create index for in_game_name
CREATE INDEX IF NOT EXISTS idx_registrations_in_game_name ON public.tournament_registrations(in_game_name);

-- Add winner fields to tournament_registrations
ALTER TABLE public.tournament_registrations
ADD COLUMN IF NOT EXISTS winner_position INTEGER CHECK (winner_position IN (1, 2, 3));