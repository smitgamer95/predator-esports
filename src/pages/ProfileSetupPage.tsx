import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/profile';
import { toast } from 'sonner';

export default function ProfileSetupPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    game_name: '',
    uid: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.game_name || !formData.uid) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) return;

    setLoading(true);

    const { error } = await updateProfile(user.id, formData);

    if (error) {
      toast.error('Failed to update profile');
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast.success('Profile completed successfully!');
    navigate('/tournaments');
    setLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader>
          <CardTitle className="text-balance text-2xl">Complete Your Profile</CardTitle>
          <CardDescription className="text-pretty">
            Please provide your details to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game_name">Game Name *</Label>
              <Input
                id="game_name"
                type="text"
                placeholder="Your in-game name"
                value={formData.game_name}
                onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
                required
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uid">Game UID *</Label>
              <Input
                id="uid"
                type="text"
                placeholder="Your game UID"
                value={formData.uid}
                onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                required
                className="bg-input"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
