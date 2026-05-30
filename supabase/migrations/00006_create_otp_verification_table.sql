
CREATE TABLE public.otp_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_email ON public.otp_verification(email);
CREATE INDEX idx_otp_expires ON public.otp_verification(expires_at);
