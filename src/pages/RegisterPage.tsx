import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/db/supabase';
import { sendOTP, verifyOTP } from '@/services/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    // Temporarily disabled - coming soon
    toast.info('Google Sign-Up will be available soon! Please use email registration for now.');
    return;

    // Original code kept for future re-enable
    // if (!agreedToTerms) {
    //   toast.error('Please agree to the Terms & Conditions and Privacy Policy');
    //   return;
    // }

    // setLoading(true);
    // const { data, error } = await supabase.auth.signInWithSSO({
    //   domain: 'miaoda-gg.com',
    //   options: {
    //     redirectTo: window.location.origin,
    //   },
    // });

    // if (error) {
    //   toast.error('Google sign up failed. Please try again.');
    //   setLoading(false);
    //   return;
    // }

    // if (data?.url) {
    //   window.open(data.url, '_self');
    // }
  };

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    console.log('Checking email:', email);

    // Check if email already exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (data) {
      toast.error('Account already exists. Please login.');
      setTimeout(() => navigate('/login'), 1500);
      setLoading(false);
      return;
    }

    console.log('Email available, sending OTP...');

    // Send OTP
    const { success, error: otpError } = await sendOTP(email);

    if (!success) {
      console.error('OTP send failed:', otpError);
      toast.error(otpError || 'Failed to send OTP. Please try again.');
      setLoading(false);
      return;
    }

    console.log('OTP sent successfully to email');
    toast.success('OTP sent to your email. Please check your inbox and spam folder.');
    setStep('otp');
    setLoading(false);
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    console.log('Verifying OTP for:', email);

    const { valid, error } = await verifyOTP(email, otp);

    if (!valid) {
      console.error('OTP verification failed:', error);
      toast.error(error || 'Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    console.log('OTP verified successfully');
    toast.success('OTP verified! Please create your password.');
    setStep('password');
    setLoading(false);
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please enter password and confirm password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error('Registration failed. Please try again.');
      setLoading(false);
      return;
    }

    toast.success('Registration successful! Please complete your profile.');
    navigate('/profile-setup');
    setLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-2xl">Register for Predator E-Sports</CardTitle>
          <CardDescription className="text-pretty">Create an account to start competing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {step === 'email' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleEmailCheck} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-input"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <Link to="/terms-conditions" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Checking...' : 'Continue'}
                  </Button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOTPVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="bg-input"
                  />
                  <p className="text-sm text-muted-foreground">
                    OTP sent to {email}. Please check your inbox and spam folder.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('email')}
                >
                  Back
                </Button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-display">Email</Label>
                  <Input
                    id="email-display"
                    type="email"
                    value={email}
                    disabled
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
