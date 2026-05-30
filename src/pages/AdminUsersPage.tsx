import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Profile } from '@/types/database';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

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
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-balance text-4xl font-bold text-foreground">User Management</h1>
        <p className="text-pretty text-muted-foreground">View and manage registered users</p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading users...</p>
      ) : users.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No users registered yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="border-border bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-balance">{user.name || 'No name'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge className={user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    <span className="font-semibold">{user.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Game Name:</span>{' '}
                    <span className="font-semibold">{user.game_name || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">UID:</span>{' '}
                    <span className="font-semibold">{user.uid || 'Not provided'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
