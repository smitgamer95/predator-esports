import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/db/supabase';
import { adminConfig } from '@/lib/config';
import { sendOTP, verifyOTP } from '@/services/auth';

export default function DebugPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const showAdminCredentials = () => {
    addResult('=== ADMIN CREDENTIALS ===');
    addResult(`Email: ${adminConfig.email}`);
    addResult(`Password: ${adminConfig.password}`);
    addResult('');
    addResult('Copy these credentials to login:');
    addResult('1. Go to /admin-login');
    addResult('2. Enter the email and password shown above');
    addResult('3. Click "Admin Login"');
    addResult('========================');
  };

  const testAdminCredentials = async () => {
    addResult('=== Testing Admin Credentials ===');
    addResult(`Admin Email from config: ${adminConfig.email}`);
    addResult(`Admin Password from config: ${adminConfig.password}`);
    addResult('');

    // Test credential validation
    const isValid = adminConfig.email === 'admin@predator.com' && 
                    adminConfig.password === '#Predator@2026!';
    addResult(`Credentials match expected: ${isValid ? '✅ YES' : '❌ NO'}`);
    addResult('');

    try {
      addResult('Attempting Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminConfig.email,
        password: adminConfig.password,
      });

      if (error) {
        addResult(`❌ Login failed: ${error.message}`);
        addResult(`Error code: ${error.status}`);
      } else {
        addResult(`✅ Login successful!`);
        addResult(`User ID: ${data.user?.id}`);
        addResult(`Email: ${data.user?.email}`);
        
        // Check profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user?.id)
          .single();
        
        addResult(`Profile role: ${profile?.role}`);
        addResult(`Profile name: ${profile?.name || 'Not set'}`);
        
        // Sign out
        await supabase.auth.signOut();
        addResult('✅ Signed out successfully');
      }
    } catch (err) {
      addResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testOTPInsertion = async () => {
    addResult('=== Testing OTP System ===');
    const testEmail = `test${Date.now()}@example.com`;
    addResult(`Test email: ${testEmail}`);
    addResult('');

    try {
      addResult('Sending OTP via EmailJS...');
      const { success, error } = await sendOTP(testEmail);

      if (!success) {
        addResult(`❌ OTP send failed: ${error}`);
        return;
      }

      addResult(`✅ OTP sent successfully to ${testEmail}`);
      addResult('⚠️ Check the email inbox for OTP');
      addResult('Note: OTP is not displayed for security reasons');
      addResult('');
      addResult('To test verification, check your email and use the OTP');
    } catch (err) {
      addResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const checkAdminUser = async () => {
    addResult('Checking admin user in database...');
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', adminConfig.email)
        .maybeSingle();

      if (error) {
        addResult(`❌ Query failed: ${error.message}`);
      } else if (!profile) {
        addResult(`❌ Admin profile not found`);
      } else {
        addResult(`✅ Admin profile found:`);
        addResult(`   ID: ${profile.id}`);
        addResult(`   Email: ${profile.email}`);
        addResult(`   Role: ${profile.role}`);
        addResult(`   Name: ${profile.name || 'Not set'}`);
      }
    } catch (err) {
      addResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-4xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-2xl">Debug & Test Panel</CardTitle>
          <CardDescription className="text-pretty">
            Test admin credentials and OTP system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-balance text-lg">Admin Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-mono text-sm">
                <div className="mb-2">
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-semibold text-primary">{adminConfig.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Password:</span>{' '}
                  <span className="font-semibold text-primary">{adminConfig.password}</span>
                </div>
              </div>
              <Button onClick={showAdminCredentials} variant="outline" className="w-full">
                Show in Results
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Button onClick={testAdminCredentials} className="w-full">
              Test Admin Login
            </Button>
            <Button onClick={testOTPInsertion} className="w-full" variant="outline">
              Test OTP System
            </Button>
            <Button onClick={checkAdminUser} className="w-full" variant="outline">
              Check Admin User
            </Button>
          </div>

          <Button onClick={clearResults} variant="destructive" className="w-full">
            Clear Results
          </Button>

          <Card className="border-border bg-background">
            <CardHeader>
              <CardTitle className="text-balance text-lg">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 space-y-1 overflow-y-auto font-mono text-sm">
                {results.length === 0 ? (
                  <p className="text-muted-foreground">No tests run yet. Click a button above to start.</p>
                ) : (
                  results.map((result, index) => (
                    <div key={index} className="text-foreground">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
            <p className="text-sm text-warning">
              <strong>Note:</strong> This debug page should be removed in production. It's only for testing authentication and OTP functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
