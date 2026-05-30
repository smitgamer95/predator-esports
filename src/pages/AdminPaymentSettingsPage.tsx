import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getPaymentSettings, updatePaymentSettings } from '@/services/payment';
import type { PaymentSettings } from '@/types/database';
import { toast } from 'sonner';
import { Save, CreditCard } from 'lucide-react';

export default function AdminPaymentSettingsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [receiverName, setReceiverName] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadSettings();
  }, [isAdmin, navigate]);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getPaymentSettings();
    if (data) {
      setSettings(data);
      setUpiId(data.upi_id);
      setReceiverName(data.receiver_name);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!upiId.trim() || !receiverName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    const { error } = await updatePaymentSettings(upiId.trim(), receiverName.trim());

    if (error) {
      toast.error('Failed to save payment settings');
      console.error(error);
    } else {
      toast.success('Payment settings saved successfully');
      await loadSettings();
    }
    setSaving(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-balance text-4xl font-bold text-foreground">Payment Settings</h1>
        <p className="text-pretty text-muted-foreground">Configure UPI payment details for tournament registrations</p>
      </div>

      {loading ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-balance">UPI Payment Configuration</CardTitle>
            </div>
            <CardDescription className="text-pretty">
              These details will be used for all tournament payment transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="upi_id">UPI ID *</Label>
              <Input
                id="upi_id"
                type="text"
                placeholder="e.g., 9876543210@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter your UPI ID (e.g., phone@paytm, username@upi)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver_name">Receiver Name *</Label>
              <Input
                id="receiver_name"
                type="text"
                placeholder="e.g., Predator E-Sports"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This name will be shown to users during payment
              </p>
            </div>

            <div className="rounded-lg border border-info/20 bg-info/10 p-4">
              <p className="text-sm font-semibold text-info">Important Notes:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
                <li>All tournament payments will be sent to this UPI ID</li>
                <li>Make sure the UPI ID is active and verified</li>
                <li>Changes will apply to all new registrations immediately</li>
                <li>Users will see this UPI ID during tournament registration</li>
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSave}
              disabled={saving || !upiId.trim() || !receiverName.trim()}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
