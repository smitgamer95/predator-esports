import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Download, Database, Key, FileText, Lock, CheckCircle2 } from 'lucide-react';

const BACKUP_EMAIL = 'smitgamer95@gmail.com';
const BACKUP_PASSWORD = 'smitpatel0677';

export default function BackupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === BACKUP_EMAIL && password === BACKUP_PASSWORD) {
      setIsAuthenticated(true);
      toast.success('Authentication successful');
    } else {
      setError('Invalid credentials. Access denied.');
      toast.error('Invalid credentials');
    }
  };

  const handleExportDatabase = async () => {
    setExporting(true);
    try {
      // Get all table names
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) throw tablesError;

      let sqlExport = '-- Predator E-Sports Database Export\n';
      sqlExport += `-- Generated: ${new Date().toISOString()}\n\n`;

      // Export data from each table
      const tableNames = [
        'profiles',
        'tournaments',
        'tournament_registrations',
        'support_messages',
        'otp_verification',
        'payment_screenshots',
      ];

      for (const tableName of tableNames) {
        try {
          const { data, error } = await supabase.from(tableName).select('*');

          if (!error && data && data.length > 0) {
            sqlExport += `\n-- Table: ${tableName}\n`;
            sqlExport += `-- Records: ${data.length}\n\n`;

            data.forEach((row) => {
              const columns = Object.keys(row).join(', ');
              const values = Object.values(row)
                .map((val) => {
                  if (val === null) return 'NULL';
                  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                  if (typeof val === 'boolean') return val ? 'true' : 'false';
                  if (val instanceof Date) return `'${val.toISOString()}'`;
                  return val;
                })
                .join(', ');

              sqlExport += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
            });
          }
        } catch (err) {
          console.error(`Error exporting ${tableName}:`, err);
        }
      }

      // Create and download the file
      const blob = new Blob([sqlExport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `predator-esports-backup-${Date.now()}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Database exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export database');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCredentials = () => {
    const credentials = `# Predator E-Sports - Project Credentials
# Generated: ${new Date().toISOString()}

## Supabase Configuration
VITE_SUPABASE_URL=https://xqaqobndxyqmdvgspvsy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYXFvYm5keHlxbWR2Z3NwdnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjgyOTEsImV4cCI6MjA5MzI0NDI5MX0.dJzqPg9HcCM2IMedz7-JRdLfUfnsfcK3nMJoTVnlGG4
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYXFvYm5keHlxbWR2Z3NwdnN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY2ODI5MSwiZXhwIjoyMDkzMjQ0MjkxfQ.Z1EBJCZ-o2kz2LgTC9wfEXvlJLSLY6nAq8c_Ul1neBI

## PostgreSQL Connection
Host: db.xqaqobndxyqmdvgspvsy.supabase.co
Port: 5432
User: postgres
Database: postgres
Connection String: postgresql://postgres:[YOUR_PASSWORD]@db.xqaqobndxyqmdvgspvsy.supabase.co:5432/postgres

## EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_t5ze169
VITE_EMAILJS_TEMPLATE_ID=template_6f3clm6
VITE_EMAILJS_PUBLIC_KEY=WfDRrTYlq3oH0xMfyxnYU

## Admin Credentials
Admin Email: admin@predator.com
Admin Password: #Predator@2026!

## Backup Access
Backup Email: smitgamer95@gmail.com
Backup Password: smitpatel0677

## Important Notes
- Keep these credentials secure and private
- Never commit these to public repositories
- The Service Role Key bypasses all RLS policies
- Use the Service Role Key only for administrative tasks
`;

    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predator-esports-credentials-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Credentials exported successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-balance text-center text-2xl">Secure Backup Access</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access project backup and export features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                />
              </div>
              <Button type="submit" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-success" />
          <h1 className="text-balance text-3xl font-bold text-foreground">Backup & Export Center</h1>
        </div>
        <p className="text-pretty text-sm text-muted-foreground">
          Secure access to project credentials, database exports, and backup information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Database Export */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-balance">Database Export</CardTitle>
            </div>
            <CardDescription>
              Export all database tables and data as SQL file for backup and migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportDatabase} disabled={exporting} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export Database (SQL)'}
            </Button>
          </CardContent>
        </Card>

        {/* Credentials Export */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-balance">Project Credentials</CardTitle>
            </div>
            <CardDescription>
              Download all API keys, database credentials, and configuration details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportCredentials} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export Credentials
            </Button>
          </CardContent>
        </Card>

        {/* Project Information */}
        <Card className="border-border bg-card md:col-span-2">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-balance">Project Information</CardTitle>
            </div>
            <CardDescription>Essential details about your Predator E-Sports platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">Supabase Project</h3>
              <p className="text-sm text-muted-foreground">
                <strong>URL:</strong> https://xqaqobndxyqmdvgspvsy.supabase.co
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Organization ID:</strong> kxfsexbaljqvimlbqdof
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">Admin Access</h3>
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> admin@predator.com
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Password:</strong> #Predator@2026!
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="mb-2 font-semibold">Source Code Access</h3>
              <p className="text-pretty text-sm text-muted-foreground">
                To download the complete source code with all files and folders, please use the Medo
                platform's export feature. Look for "Download Project" or "Export Code" in your project
                settings.
              </p>
            </div>

            <Alert>
              <AlertDescription className="text-pretty text-sm">
                <strong>Security Notice:</strong> Keep all exported files secure. The credentials and keys
                provide full access to your database and services. Never share these files publicly or
                commit them to version control.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
