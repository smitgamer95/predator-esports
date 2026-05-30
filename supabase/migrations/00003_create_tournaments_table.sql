
CREATE TYPE public.tournament_mode AS ENUM ('Solo', 'Duo', 'Squad');
CREATE TYPE public.tournament_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entry_fee numeric NOT NULL DEFAULT 0,
  mode public.tournament_mode NOT NULL,
  prize_1st numeric NOT NULL DEFAULT 0,
  prize_2nd numeric NOT NULL DEFAULT 0,
  prize_3rd numeric NOT NULL DEFAULT 0,
  status public.tournament_status NOT NULL DEFAULT 'active'::public.tournament_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tournaments_status ON public.tournaments(status);
