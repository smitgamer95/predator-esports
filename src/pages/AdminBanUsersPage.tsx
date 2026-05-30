import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Search, Ban, CheckCircle2, Mail, Phone, User } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  game_name: string | null;
  banned: boolean;
  created_at: string;
}

export default function AdminBanUsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleBanUser = async (userId: string, currentBanStatus: boolean) => {
    setUpdating(userId);
    const newBanStatus = !currentBanStatus;
    
    const { error } = await supabase
      .from('profiles')
      .update({ banned: newBanStatus })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update ban status');
      console.error(error);
    } else {
      toast.success(newBanStatus ? 'User banned successfully' : 'User unbanned successfully');
      loadUsers();
    }
    setUpdating(null);
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      user.game_name?.toLowerCase().includes(query)
    );
  });

  const bannedUsers = filteredUsers.filter(u => u.banned);
  const activeUsers = filteredUsers.filter(u => !u.banned);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl p-4">
          <h1 className="text-balance text-3xl font-bold">Ban Users Management</h1>
          <p className="mt-2 text-muted-foreground">Manage user access and ban/unban accounts</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl p-4">
        {/* Search */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or game name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Users */}
            <Card className="border-border bg-card">
              <CardHeader className="p-4">
                <CardTitle className="text-balance text-xl">
                  Active Users ({activeUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {activeUsers.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No active users found</p>
                ) : (
                  <div className="space-y-3">
                    {activeUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <p className="font-semibold">{user.name || 'No name'}</p>
                            <Badge className="bg-success/20 text-success">Active</Badge>
                          </div>
                          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                            {user.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            {user.game_name && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Game:</span>
                                <span>{user.game_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBanUser(user.id, user.banned)}
                          disabled={updating === user.id}
                          className="shrink-0"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {updating === user.id ? 'Banning...' : 'Ban User'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Banned Users */}
            <Card className="border-destructive/50 bg-card">
              <CardHeader className="p-4">
                <CardTitle className="text-balance text-xl text-destructive">
                  Banned Users ({bannedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {bannedUsers.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No banned users</p>
                ) : (
                  <div className="space-y-3">
                    {bannedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-destructive" />
                            <p className="font-semibold">{user.name || 'No name'}</p>
                            <Badge className="bg-destructive/20 text-destructive">Banned</Badge>
                          </div>
                          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                            {user.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            {user.game_name && (
                              <div className="flex items-center gap-1">
                                <span className="font-semibold">Game:</span>
                                <span>{user.game_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanUser(user.id, user.banned)}
                          disabled={updating === user.id}
                          className="shrink-0 border-success text-success hover:bg-success/10"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {updating === user.id ? 'Unbanning...' : 'Unban User'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
