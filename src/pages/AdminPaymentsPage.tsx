import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { TournamentRegistration } from '@/types/database';
import { toast } from 'sonner';
import { Check, X, Eye, Edit } from 'lucide-react';

type RegistrationWithDetails = TournamentRegistration & {
  profiles: { name: string; email: string; phone: string; game_name: string; uid: string } | null;
  tournaments: { name: string; mode: string; entry_fee: number } | null;
};

export default function AdminPaymentsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationWithDetails | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEditSlotDialog, setShowEditSlotDialog] = useState(false);
  const [newSlotNumber, setNewSlotNumber] = useState<number>(0);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadRegistrations();
  }, [isAdmin, navigate]);

  const loadRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        *,
        profiles:user_id (name, email, phone, game_name, uid),
        tournaments:tournament_id (name, mode, entry_fee)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load registrations');
      console.error(error);
    } else {
      setRegistrations(data as RegistrationWithDetails[] || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('tournament_registrations')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve registration');
      console.error(error);
    } else {
      toast.success('Registration approved successfully');
      loadRegistrations();
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    const { error } = await supabase
      .from('tournament_registrations')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
      })
      .eq('id', selectedRegistration.id);

    if (error) {
      toast.error('Failed to reject registration');
      console.error(error);
    } else {
      toast.success('Registration rejected');
      setShowRejectDialog(false);
      setSelectedRegistration(null);
      setRejectionReason('');
      loadRegistrations();
    }
  };

  const handleEditSlot = (registration: RegistrationWithDetails) => {
    setSelectedRegistration(registration);
    setNewSlotNumber(registration.slot_number || 0);
    setShowEditSlotDialog(true);
  };

  const handleUpdateSlot = async () => {
    if (!selectedRegistration) return;

    if (!newSlotNumber || newSlotNumber < 1) {
      toast.error('Please enter a valid slot number');
      return;
    }

    // Check if slot number is already taken by another player
    const existingSlot = registrations.find(
      r => r.slot_number === newSlotNumber && r.id !== selectedRegistration.id && r.tournament_id === selectedRegistration.tournament_id
    );

    if (existingSlot) {
      toast.error(`Slot ${newSlotNumber} is already taken by ${existingSlot.username || existingSlot.profiles?.name}`);
      return;
    }

    const { error } = await supabase
      .from('tournament_registrations')
      .update({ slot_number: newSlotNumber })
      .eq('id', selectedRegistration.id);

    if (error) {
      toast.error('Failed to update slot number');
      console.error(error);
    } else {
      toast.success(`Slot number updated to ${newSlotNumber}`);
      setShowEditSlotDialog(false);
      setSelectedRegistration(null);
      loadRegistrations();
    }
  };

  const openRejectDialog = (registration: RegistrationWithDetails) => {
    setSelectedRegistration(registration);
    setShowRejectDialog(true);
  };

  const handleRemove = async (registration: RegistrationWithDetails) => {
    if (!confirm(`Are you sure you want to remove ${registration.profiles?.name} from this tournament? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('id', registration.id);

    if (error) {
      toast.error('Failed to remove player');
      console.error(error);
    } else {
      toast.success('Player removed successfully');
      loadRegistrations();
    }
  };

  if (!isAdmin) return null;

  const pendingRegistrations = registrations.filter((r) => r.status === 'pending');
  const approvedRegistrations = registrations.filter((r) => r.status === 'approved');
  const rejectedRegistrations = registrations.filter((r) => r.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-balance text-4xl font-bold text-foreground">Payment Verification</h1>
        <p className="text-pretty text-muted-foreground">Review and verify payment submissions</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-balance">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{pendingRegistrations.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-balance">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">{approvedRegistrations.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-balance">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{rejectedRegistrations.length}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading registrations...</p>
      ) : registrations.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No registrations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingRegistrations.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-warning">Pending Verification</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pendingRegistrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    onApprove={handleApprove}
                    onReject={openRejectDialog}
                    onRemove={handleRemove}
                    onEditSlot={handleEditSlot}
                  />
                ))}
              </div>
            </div>
          )}

          {approvedRegistrations.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-success">Approved</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {approvedRegistrations.map((registration) => (
                  <RegistrationCard 
                    key={registration.id} 
                    registration={registration}
                    onRemove={handleRemove}
                    onEditSlot={handleEditSlot}
                  />
                ))}
              </div>
            </div>
          )}

          {rejectedRegistrations.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-destructive">Rejected</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {rejectedRegistrations.map((registration) => (
                  <RegistrationCard 
                    key={registration.id} 
                    registration={registration}
                    onRemove={handleRemove}
                    onEditSlot={handleEditSlot}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-balance">Reject Registration</DialogTitle>
            <DialogDescription className="text-pretty">
              Provide a reason for rejection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Payment screenshot is unclear, wrong amount, etc."
                className="bg-input"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleReject} variant="destructive" className="flex-1">
                Reject
              </Button>
              <Button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Slot Dialog */}
      <Dialog open={showEditSlotDialog} onOpenChange={setShowEditSlotDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Slot Number</DialogTitle>
            <DialogDescription>
              Change slot number for {selectedRegistration?.username || selectedRegistration?.profiles?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slot">New Slot Number</Label>
              <Input
                id="slot"
                type="number"
                min="1"
                value={newSlotNumber}
                onChange={(e) => setNewSlotNumber(parseInt(e.target.value) || 0)}
                placeholder="Enter slot number"
              />
              <p className="text-xs text-muted-foreground">
                Current slot: #{selectedRegistration?.slot_number || 'N/A'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateSlot} className="flex-1">
                Update Slot
              </Button>
              <Button
                onClick={() => {
                  setShowEditSlotDialog(false);
                  setSelectedRegistration(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegistrationCard({
  registration,
  onApprove,
  onReject,
  onRemove,
  onEditSlot,
}: {
  registration: RegistrationWithDetails;
  onApprove?: (id: string) => void;
  onReject?: (registration: RegistrationWithDetails) => void;
  onRemove?: (registration: RegistrationWithDetails) => void;
  onEditSlot?: (registration: RegistrationWithDetails) => void;
}) {
  const [showScreenshot, setShowScreenshot] = useState(false);

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="p-4">
        <div className="flex items-start gap-3">
          {/* Slot Number - Highlighted Top Left */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
            #{registration.slot_number || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-balance text-base">{registration.tournaments?.name}</CardTitle>
            <CardDescription className="text-pretty text-sm">
              {registration.profiles?.name}
            </CardDescription>
          </div>
          <Badge className={`status-${registration.status} shrink-0`}>{registration.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {/* Player Info Grid */}
        <div className="space-y-2 rounded-lg bg-muted/30 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username:</span>
            <span className="font-semibold">{registration.username || registration.profiles?.name}</span>
          </div>
          {registration.in_game_name && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">In-Game Name:</span>
              <span className="font-semibold text-primary">{registration.in_game_name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gamer ID:</span>
            <span className="font-semibold">{registration.gamer_id || registration.profiles?.uid || registration.profiles?.game_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-semibold">{registration.phone || registration.profiles?.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry Fee:</span>
            <span className="font-semibold text-success">₹{registration.tournaments?.entry_fee}</span>
          </div>
        </div>

        {registration.rejection_reason && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
            <p className="text-xs text-destructive">
              <strong>Rejection Reason:</strong> {registration.rejection_reason}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowScreenshot(true)}
          >
            <Eye className="mr-1 h-3 w-3" />
            Screenshot
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onEditSlot?.(registration)}
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit Slot
          </Button>
          {registration.status === 'pending' && onApprove && onReject && (
            <>
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => onApprove(registration.id)}
              >
                <Check className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onReject(registration)}
              >
                <X className="mr-1 h-3 w-3" />
                Reject
              </Button>
            </>
          )}
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              className="col-span-2 w-full"
              onClick={() => onRemove(registration)}
            >
              <X className="mr-1 h-3 w-3" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-balance">Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {registration.payment_screenshot_url && (
              <img
                src={registration.payment_screenshot_url}
                alt="Payment Screenshot"
                className="max-h-[70vh] w-auto rounded-lg"
              />
            )}
            {!registration.payment_screenshot_url && (
              <p className="text-muted-foreground">No screenshot available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
