
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  upi_id text,
  contact_email text,
  contact_phone text,
  logo_url text,
  max_slots integer DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_settings (upi_id, contact_email, contact_phone, max_slots)
VALUES ('', 'admin@predator.com', '', 100);
