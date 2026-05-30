import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { isAdminCredentials } from '@/services/auth';
import { checkProfileComplete } from '@/services/profile';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    // Temporarily disabled - coming soon
    toast.info('Google Sign-In will be available soon! Please use email login for now.');
    return;

    // Original code kept for future re-enable
    // if (!agreedToTerms) {
    //   toast.error('Please agree to the Terms & Conditions and Privacy Policy');
    //   return;
    // }

    // setLoading(true);
    // const { error } = await signInWithGoogle();
    
    // if (error) {
    //   toast.error('Google login failed. Please try again.');
    //   setLoading(false);
    //   return;
    // }

    // const { data } = await supabase.auth.getUser();
    // if (data.user) {
    //   const isComplete = await checkProfileComplete(data.user.id);
    //   if (!isComplete) {
    //     navigate('/profile-setup');
    //   } else {
    //     navigate('/tournaments');
    //   }
    // }
    // setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    console.log('Login attempt for:', email);

    // Check if this is admin credentials - reject on normal login
    const isAdmin = isAdminCredentials(email, password);
    if (isAdmin) {
      console.log('Admin credentials detected on normal login - rejecting');
      toast.error('Admin accounts cannot login here. Please use the admin login page.');
      setLoading(false);
      return;
    }

    const { error } = await signInWithEmail(email, password);

    if (error) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Account not found. Please register first.');
        setTimeout(() => navigate('/register'), 1500);
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
      setLoading(false);
      return;
    }

    console.log('Login successful');

    // Check profile completion
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const isComplete = await checkProfileComplete(data.user.id);
      if (!isComplete) {
        navigate('/profile-setup');
      } else {
        navigate('/tournaments');
      }
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-2xl">Login to Predator E-Sports</CardTitle>
          <CardDescription className="text-pretty">Sign in to join tournaments and compete</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
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
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
