import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trophy, DollarSign, Settings, Ban, MessageSquare, Zap } from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Professional Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
              <Settings className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">Admin Dashboard</h1>
              <p className="text-pretty text-muted-foreground">Manage tournaments, users, and platform settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Main Management Cards */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Management</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-balance">Tournaments</CardTitle>
                    <CardDescription className="text-pretty">Create and manage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Create new tournaments, edit existing ones, view registered players, and manage tournament lifecycle.
                </p>
                <Button asChild className="w-full shadow-sm">
                  <Link to="/admin/tournaments">Manage Tournaments</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-blue-500/5 to-blue-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-balance">Users</CardTitle>
                    <CardDescription className="text-pretty">Manage accounts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  View all registered users, manage roles, and monitor user activity across the platform.
                </p>
                <Button asChild className="w-full shadow-sm" variant="outline">
                  <Link to="/admin/users">View Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:border-destructive/50 hover:shadow-lg">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-destructive/5 to-destructive/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
                    <Ban className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-balance">Ban Users</CardTitle>
                    <CardDescription className="text-pretty">Manage access</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Ban or unban users who violate platform rules. Banned users cannot login to the platform.
                </p>
                <Button asChild className="w-full shadow-sm" variant="destructive">
                  <Link to="/admin/ban-users">Manage Bans</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-green-500/5 to-green-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-balance">Payments</CardTitle>
                    <CardDescription className="text-pretty">Verify submissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Review payment screenshots, approve or reject registrations, and manage payment verification.
                </p>
                <Button asChild className="w-full shadow-sm">
                  <Link to="/admin/payments">Verify Payments</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-purple-500/5 to-purple-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                    <MessageSquare className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-balance">Support</CardTitle>
                    <CardDescription className="text-pretty">Help users</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  View and respond to user support tickets. Help users resolve their issues quickly.
                </p>
                <Button asChild className="w-full shadow-sm" variant="outline">
                  <Link to="/admin/support-messages">Support Messages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group h-full overflow-hidden border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-orange-500/5 to-orange-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                    <Settings className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-balance">Settings</CardTitle>
                    <CardDescription className="text-pretty">Platform config</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Configure UPI ID, contact information, and manage platform settings.
                </p>
                <Button asChild className="w-full shadow-sm" variant="outline">
                  <Link to="/admin/settings">Platform Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 shadow-lg">
          <CardHeader className="border-b border-primary/20 bg-primary/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-balance text-xl">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="w-full shadow-sm" size="lg">
                <Link to="/admin/tournaments">Create Tournament</Link>
              </Button>
              <Button asChild className="w-full shadow-sm" size="lg" variant="default">
                <Link to="/admin/live-tournament">🎮 Live Control</Link>
              </Button>
              <Button asChild className="w-full shadow-sm" size="lg" variant="outline">
                <Link to="/admin/payments">Pending Payments</Link>
              </Button>
              <Button asChild className="w-full shadow-sm" size="lg" variant="outline">
                <Link to="/admin/ban-users">Ban Management</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
