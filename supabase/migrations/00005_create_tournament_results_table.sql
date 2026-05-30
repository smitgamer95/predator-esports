
CREATE TABLE public.tournament_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE UNIQUE,
  first_place_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  second_place_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  third_place_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_results_tournament ON public.tournament_results(tournament_id);
