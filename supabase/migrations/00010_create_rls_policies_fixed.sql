
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Tournaments policies
CREATE POLICY "Anyone can view active tournaments" ON public.tournaments
  FOR SELECT USING (status = 'active'::public.tournament_status OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage tournaments" ON public.tournaments
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Tournament registrations policies
CREATE POLICY "Users can view their own registrations" ON public.tournament_registrations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations" ON public.tournament_registrations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending registrations" ON public.tournament_registrations
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id AND status = 'pending'::public.registration_status)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations" ON public.tournament_registrations
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Tournament results policies
CREATE POLICY "Anyone can view results" ON public.tournament_results
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage results" ON public.tournament_results
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- OTP verification policies (no public access)
CREATE POLICY "No direct access to OTP" ON public.otp_verification
  FOR ALL USING (false);

-- Admin settings policies
CREATE POLICY "Anyone can view admin settings" ON public.admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update settings" ON public.admin_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
