
-- Allow anonymous (public) users to insert OTPs for registration
CREATE POLICY "Allow public to insert OTP for registration" ON public.otp_verification
  FOR INSERT TO anon
  WITH CHECK (true);
