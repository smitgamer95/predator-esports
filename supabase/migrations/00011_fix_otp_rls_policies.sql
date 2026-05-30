
-- Drop the restrictive policy
DROP POLICY IF EXISTS "No direct access to OTP" ON public.otp_verification;

-- Allow authenticated users to insert OTPs (for registration flow)
CREATE POLICY "Allow authenticated users to insert OTP" ON public.otp_verification
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow service role to manage OTPs (for cleanup)
CREATE POLICY "Service role can manage OTPs" ON public.otp_verification
  FOR ALL
  USING (true);

-- Create a function to verify OTP (secure, doesn't expose OTP values)
CREATE OR REPLACE FUNCTION verify_otp_code(check_email text, check_otp text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_record RECORD;
BEGIN
  SELECT * INTO otp_record
  FROM public.otp_verification
  WHERE email = check_email
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF otp_record.expires_at < NOW() THEN
    RETURN false;
  END IF;

  IF otp_record.otp = check_otp THEN
    -- Delete used OTP
    DELETE FROM public.otp_verification WHERE id = otp_record.id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;
