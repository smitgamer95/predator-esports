import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/profile';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    game_name: '',
    uid: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        game_name: profile.game_name || '',
        uid: profile.uid || '',
      });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    const { error } = await updateProfile(user.id, formData);

    if (error) {
      toast.error('Failed to update profile');
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast.success('Profile updated successfully!');
    setEditing(false);
    setLoading(false);
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto w-full max-w-2xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-2xl">My Profile</CardTitle>
          <CardDescription className="text-pretty">View and manage your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          {!editing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-foreground">{profile.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-foreground">{profile.name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="text-foreground">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Game Name</Label>
                <p className="text-foreground">{profile.game_name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Game UID</Label>
                <p className="text-foreground">{profile.uid || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <p className="text-foreground capitalize">{profile.role}</p>
              </div>
              <Button onClick={() => setEditing(true)} className="w-full">
                Edit Profile
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game_name">Game Name</Label>
                <Input
                  id="game_name"
                  type="text"
                  value={formData.game_name}
                  onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uid">Game UID</Label>
                <Input
                  id="uid"
                  type="text"
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
