import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminSettings } from '@/types/database';
import { toast } from 'sonner';
import { Mail, Phone, Send } from 'lucide-react';
import { getAdminSettings } from '@/services/tournament';

export default function SupportPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getAdminSettings();
    setSettings(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        });

      if (error) throw error;

      toast.success('Ticket submitted successfully! View your tickets to see replies.');
      setFormData({ name: '', email: '', message: '' });
      
      // Redirect to My Tickets page if user is logged in
      if (user) {
        setTimeout(() => {
          navigate('/my-tickets');
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="mb-2 text-balance text-3xl font-bold text-foreground">Support</h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Need help? Send us a message and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Information */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-balance text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings?.contact_email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${settings.contact_email}`} className="font-semibold text-primary hover:underline">
                    {settings.contact_email}
                  </a>
                </div>
              </div>
            )}
            {settings?.contact_phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href={`tel:${settings.contact_phone}`} className="font-semibold text-primary hover:underline">
                    {settings.contact_phone}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Form */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-balance text-lg">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="bg-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="bg-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue or question..."
                  className="min-h-32 bg-input"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                <Send className="mr-2 h-5 w-5" />
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
