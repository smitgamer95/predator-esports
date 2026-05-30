
CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  payment_screenshot_url text,
  status public.registration_status NOT NULL DEFAULT 'pending'::public.registration_status,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tournament_id)
);

CREATE INDEX idx_registrations_user ON public.tournament_registrations(user_id);
CREATE INDEX idx_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_registrations_status ON public.tournament_registrations(status);
