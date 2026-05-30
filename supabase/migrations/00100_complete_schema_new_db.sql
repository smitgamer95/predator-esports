-- Complete Database Schema for Predator E-Sports
-- Migration: 00001_complete_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create tournament_status enum
DO $$ BEGIN
  CREATE TYPE public.tournament_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create registration_status enum
DO $$ BEGIN
  CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create support_status enum
DO $$ BEGIN
  CREATE TYPE public.support_status AS ENUM ('open', 'pending', 'replied', 'closed', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  phone text,
  game_name text,
  uid text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'user'::public.user_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  game_type text NOT NULL,
  entry_fee numeric NOT NULL DEFAULT 0,
  prize_pool numeric NOT NULL DEFAULT 0,
  max_participants integer NOT NULL DEFAULT 100,
  status public.tournament_status NOT NULL DEFAULT 'upcoming'::public.tournament_status,
  thumbnail_url text,
  start_datetime timestamptz NOT NULL,
  registration_end_datetime timestamptz NOT NULL,
  room_id text,
  room_password text,
  room_reveal_datetime timestamptz,
  total_slots integer NOT NULL DEFAULT 100,
  youtube_stream_link text,
  instagram_stream_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_datetime ON public.tournaments(start_datetime);

-- ============================================
-- TOURNAMENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  in_game_name text,
  gamer_id text,
  phone text NOT NULL,
  payment_screenshot_url text,
  status public.registration_status NOT NULL DEFAULT 'pending'::public.registration_status,
  slot_number integer,
  eliminated boolean NOT NULL DEFAULT false,
  winner_position integer CHECK (winner_position IN (1, 2, 3)),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.tournament_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_slot ON public.tournament_registrations(slot_number);

-- ============================================
-- TOURNAMENT RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournament_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position integer NOT NULL,
  prize_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_results_tournament ON public.tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON public.tournament_results(user_id);

-- ============================================
-- ADMIN SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name text NOT NULL DEFAULT 'Predator E-Sports',
  logo_url text,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  youtube_link text,
  instagram_link text,
  emailjs_service_id text,
  emailjs_template_id text,
  emailjs_public_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default admin settings
INSERT INTO public.admin_settings (site_name, contact_email, contact_phone)
VALUES ('Predator E-Sports', 'admin@predator.com', '+91 1234567890')
ON CONFLICT DO NOTHING;

-- ============================================
-- PAYMENT SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  upi_id text NOT NULL,
  qr_code_url text,
  payment_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default payment settings
INSERT INTO public.payment_settings (upi_id, payment_instructions)
VALUES ('predator@upi', 'Please send payment to the UPI ID above and upload screenshot.')
ON CONFLICT DO NOTHING;

-- ============================================
-- SUPPORT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  reply text,
  status public.support_status NOT NULL DEFAULT 'open'::public.support_status,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_status ON public.support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_email ON public.support_messages(email);

-- ============================================
-- OTP VERIFICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.otp_verification (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_verification(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON public.otp_verification(expires_at);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-thumbnails', 'tournament-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verification ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tournaments Policies
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert tournaments" ON public.tournaments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update tournaments" ON public.tournaments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete tournaments" ON public.tournaments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tournament Registrations Policies
CREATE POLICY "Users can view all approved registrations" ON public.tournament_registrations
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert their own registration" ON public.tournament_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending registration" ON public.tournament_registrations
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any registration" ON public.tournament_registrations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tournament Results Policies
CREATE POLICY "Results are viewable by everyone" ON public.tournament_results
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage results" ON public.tournament_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin Settings Policies
CREATE POLICY "Settings are viewable by everyone" ON public.admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payment Settings Policies
CREATE POLICY "Payment settings are viewable by everyone" ON public.payment_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update payment settings" ON public.payment_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Support Messages Policies
CREATE POLICY "Anyone can insert support messages" ON public.support_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own messages" ON public.support_messages
  FOR SELECT USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update support messages" ON public.support_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- OTP Verification Policies
CREATE POLICY "Anyone can insert OTP" ON public.otp_verification
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view their own OTP" ON public.otp_verification
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update their own OTP" ON public.otp_verification
  FOR UPDATE USING (true);

-- Storage Policies
CREATE POLICY "Anyone can view payment screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Authenticated users can upload payment screenshots" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view tournament thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'tournament-thumbnails');

CREATE POLICY "Admins can upload tournament thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tournament-thumbnails' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
