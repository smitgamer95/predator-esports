import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { getTournamentById, getUserRegistration, getTournamentRegistrations, getAdminSettings, createRegistration } from '@/services/tournament';
import { getPaymentSettings } from '@/services/payment';
import { checkProfileComplete, getProfile } from '@/services/profile';
import { supabase } from '@/db/supabase';
import BooyahCelebration from '@/components/BooyahCelebration';
import type { Tournament, TournamentRegistration, AdminSettings, PaymentSettings } from '@/types/database';
import { toast } from 'sonner';
import { Calendar, Clock, Timer, Youtube, Instagram, Copy, CheckCircle2, Trophy, Upload } from 'lucide-react';
import { formatDate, formatTime, getCountdown, isRegistrationClosed } from '@/lib/dateUtils';

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registration, setRegistration] = useState<TournamentRegistration | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<TournamentRegistration[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'info' | 'upload'>('info');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [inGameName, setInGameName] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [upiOpened, setUpiOpened] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [countdown, setCountdown] = useState({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    isRevealTime: false,
    isExpired: false,
    isMatchStarted: false,
    text: ''
  });
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showBooyah, setShowBooyah] = useState(false);
  const [winnerPosition, setWinnerPosition] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, user]);

  useEffect(() => {
    if (!tournament) return;
    const interval = setInterval(() => {
      const cd = getCountdown(tournament.start_datetime);
      setCountdown(cd);
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  const loadData = async () => {
    setLoading(true);
    const tournamentData = await getTournamentById(id!);
    setTournament(tournamentData);

    if (user) {
      const regData = await getUserRegistration(id!, user.id);
      console.log('Registration data loaded:', regData);
      setRegistration(regData);
      
      // Check if user is a winner
      if (regData && regData.winner_position) {
        setWinnerPosition(regData.winner_position as 1 | 2 | 3);
        // Show Booyah celebration only once
        const hasSeenBooyah = localStorage.getItem(`booyah_${id}_${user.id}`);
        if (!hasSeenBooyah) {
          setShowBooyah(true);
          localStorage.setItem(`booyah_${id}_${user.id}`, 'true');
        }
      }
    }

    // Fetch all approved registrations for slot list
    const allRegs = await getTournamentRegistrations(id!);
    setAllRegistrations(allRegs);

    const settingsData = await getAdminSettings();
    setSettings(settingsData);

    // Fetch payment settings
    const paymentData = await getPaymentSettings();
    setPaymentSettings(paymentData);

    setLoading(false);
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isComplete = await checkProfileComplete(user.id);
    if (!isComplete) {
      toast.error('Please complete your profile first');
      navigate('/profile');
      return;
    }

    if (!tournament) return;

    // Show payment dialog
    setPaymentStep('info');
    setShowPaymentDialog(true);
  };

  const handlePayNow = () => {
    if (!tournament || !paymentSettings) return;

    // Build dynamic UPI URL
    const upiUrl = `upi://pay?pa=${encodeURIComponent(paymentSettings.upi_id)}&pn=${encodeURIComponent(paymentSettings.receiver_name)}&am=${tournament.entry_fee}&cu=INR`;
    
    // Try to open UPI app
    window.location.href = upiUrl;
    
    // Check if UPI opened after 2 seconds
    setTimeout(() => {
      setUpiOpened(true);
      setPaymentStep('upload');
    }, 2000);
  };

  const copyUpiId = () => {
    if (paymentSettings) {
      navigator.clipboard.writeText(paymentSettings.upi_id);
      setCopiedUpi(true);
      toast.success('UPI ID copied to clipboard');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error('File size must be less than 1MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setScreenshotFile(file);
    }
  };

  const uploadScreenshot = async (): Promise<string> => {
    if (!screenshotFile) {
      throw new Error('No screenshot file selected');
    }

    const fileExt = screenshotFile.name.split('.').pop();
    const fileName = `${user!.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, screenshotFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const submitRegistration = async (screenshotUrl: string) => {
    if (!tournament || !user) return;

    setRegistering(true);
    try {
      // Validate in-game name
      if (!inGameName.trim()) {
        toast.error('Please enter your in-game name');
        setRegistering(false);
        return;
      }

      // Get user profile for username, phone, and gamer_id
      const profile = await getProfile(user.id);
      if (!profile || !profile.name || !profile.phone) {
        toast.error('Profile information missing');
        setRegistering(false);
        return;
      }

      // Get gamer_id (uid or game_name)
      const gamerId = profile.uid || profile.game_name || '';

      const { error } = await createRegistration(
        tournament.id,
        user.id,
        screenshotUrl,
        profile.name,
        profile.phone,
        gamerId,
        inGameName.trim()
      );

      if (error) {
        throw error;
      }

      toast.success('Registration Submitted! Status: Pending Approval');
      setShowPaymentDialog(false);
      setPaymentStep('info');
      setScreenshotFile(null);
      setInGameName('');
      setUpiOpened(false);
      await loadData();
    } catch (error) {
      toast.error('Registration failed');
      console.error(error);
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmitRegistration = async () => {
    // For paid tournaments, screenshot is required
    if (tournament?.entry_fee && tournament.entry_fee > 0) {
      if (!screenshotFile) {
        toast.error('Please upload payment screenshot');
        return;
      }
    }

    setUploadingScreenshot(true);
    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot();
      }
      await submitRegistration(screenshotUrl);
    } catch (error) {
      toast.error('Failed to upload screenshot');
      console.error(error);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const copyToClipboard = (text: string, type: 'room' | 'password') => {
    navigator.clipboard.writeText(text);
    if (type === 'room') {
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
    toast.success('Copied to clipboard');
  };

  const openExternalLink = (url: string) => {
    // Ensure URL has protocol
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading tournament details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Tournament not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClosed = isRegistrationClosed(tournament.start_datetime);
  const isFull = (tournament.filled_slots || 0) >= (tournament.max_slots || 100);
  
  // Check if tournament has ended (end_datetime passed)
  const isEnded = tournament.end_datetime ? new Date() >= new Date(tournament.end_datetime) : false;
  
  // Registration is disabled if closed, full, or ended
  const canRegister = !isClosed && !isFull && !isEnded;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Thumbnail Banner */}
        {tournament.thumbnail_url && (
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={tournament.thumbnail_url}
              alt={tournament.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Tournament Header */}
        <Card className="border-border bg-card">
          <CardHeader className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-balance text-2xl">{tournament.name}</CardTitle>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="default" className="bg-primary/20 text-primary">
                    {tournament.mode}
                  </Badge>
                  <Badge variant="default" className="bg-success/20 text-success">
                    ₹{tournament.entry_fee} Entry
                  </Badge>
                  {registration && (
                    <Badge className={`status-${registration.status}`}>
                      {registration.status}
                    </Badge>
                  )}
                </div>
              </div>
              {/* Countdown Timer */}
              <div className="shrink-0 rounded-lg bg-primary/10 p-3 text-center">
                <div className="flex items-center gap-1 text-sm font-bold text-primary">
                  <Timer className="h-4 w-4" />
                  <span>
                    {countdown.days > 0 && `${countdown.days}d `}
                    {countdown.hours > 0 && `${countdown.hours}h `}
                    {countdown.minutes > 0 && `${countdown.minutes}m `}
                    {countdown.seconds}s
                  </span>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(tournament.start_datetime)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(tournament.start_datetime)}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 2. Room Section (Horizontal) - For Approved Users */}
        {registration?.status === 'approved' && tournament.room_id && (
          <Card className="border-success/20 bg-success/5">
            <CardHeader className="p-4">
              <CardTitle className="text-balance text-lg">🎮 Room Details</CardTitle>
              {!countdown.isRevealTime && (
                <p className="text-xs text-muted-foreground">
                  🔒 Will be revealed 15 minutes before match start
                </p>
              )}
            </CardHeader>
            {countdown.isRevealTime ? (
              <CardContent className="p-4 pt-0">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-background p-3">
                      <p className="text-xs text-muted-foreground">Room ID</p>
                      <p className="font-mono text-lg font-bold">{tournament.room_id}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(tournament.room_id!, 'room')}
                    >
                      {copiedRoom ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {tournament.room_password && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg bg-background p-3">
                        <p className="text-xs text-muted-foreground">Password</p>
                        <p className="font-mono text-lg font-bold">{tournament.room_password}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(tournament.room_password!, 'password')}
                      >
                        {copiedPassword ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4 pt-0">
                <div className="rounded-lg bg-info/10 p-4 text-center">
                  <p className="text-sm text-info">Room details locked until 15 minutes before match</p>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* 3. Player Info - For Approved Users */}
        {registration?.status === 'approved' && (
          <Card className="border-border bg-card">
            <CardHeader className="p-4">
              <CardTitle className="text-balance text-lg">👤 Your Player Info</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {/* Winner Position Badge */}
              {registration.winner_position && (
                <div className="mb-4 rounded-lg border-2 border-yellow-500 bg-yellow-500/10 p-4 text-center">
                  <div className="mb-2 text-4xl">
                    {registration.winner_position === 1 && '🥇'}
                    {registration.winner_position === 2 && '🥈'}
                    {registration.winner_position === 3 && '🥉'}
                  </div>
                  <p className="text-lg font-bold text-yellow-500">
                    {registration.winner_position === 1 && '1st Place Winner!'}
                    {registration.winner_position === 2 && '2nd Place Winner!'}
                    {registration.winner_position === 3 && '3rd Place Winner!'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Congratulations on your achievement!
                  </p>
                </div>
              )}

              {/* Eliminated Badge */}
              {registration.eliminated && !registration.winner_position && (
                <div className="mb-4 rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-center">
                  <p className="text-lg font-bold text-destructive">❌ Eliminated</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You were eliminated from this tournament
                  </p>
                </div>
              )}

              <div className="grid gap-3 text-sm md:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-semibold">{registration.username}</p>
                </div>
                {registration.gamer_id && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Gamer ID</p>
                    <p className="font-semibold">{registration.gamer_id}</p>
                  </div>
                )}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Slot Number</p>
                  <p className="text-xl font-bold text-primary">#{registration.slot_number}</p>
                </div>
                
                {/* Status Badge */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    {registration.winner_position ? (
                      <Badge className="bg-yellow-500/20 text-yellow-500">Winner</Badge>
                    ) : registration.eliminated ? (
                      <Badge className="bg-destructive/20 text-destructive">Eliminated</Badge>
                    ) : (
                      <Badge className="bg-success/20 text-success">Active</Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. YouTube Live Section */}
        {tournament.youtube_link && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="p-4">
              <CardTitle className="text-balance text-lg">📺 Watch Live</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button
                className="w-full"
                onClick={() => openExternalLink(tournament.youtube_link!)}
              >
                <Youtube className="mr-2 h-4 w-4" />
                Watch Live on YouTube
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 5. Slot List - All Registered Players */}
        {allRegistrations.length > 0 && (
          <Card className="border-border bg-card">
            <CardHeader className="p-4">
              <CardTitle className="text-balance text-lg">🎮 Registered Players ({allRegistrations.length}/{tournament.max_slots})</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-2">
                {allRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                        #{reg.slot_number}
                      </div>
                      <div>
                        <p className="font-semibold">{reg.in_game_name || reg.username}</p>
                        {reg.gamer_id && (
                          <p className="text-xs text-muted-foreground">ID: {reg.gamer_id}</p>
                        )}
                      </div>
                    </div>
                    {reg.user_id === user?.id && (
                      <Badge variant="default" className="bg-success/20 text-success">
                        You
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. Rules Section */}
        <Card className="border-border bg-card">
          <CardHeader className="p-4">
            <CardTitle className="text-balance text-lg">📜 Rules</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Join the room 10 minutes before match start</li>
              <li>Use your registered in-game name</li>
              <li>No hacking or cheating allowed</li>
              <li>Follow admin instructions during the match</li>
              <li>Winners will be announced after verification</li>
            </ul>
          </CardContent>
        </Card>

        {/* 7. Registration Status / JOIN Button */}
        {registration && registration.status === 'pending' && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-semibold text-warning">
                ⏳ Waiting for Admin Approval
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Your registration is being reviewed. You'll be notified once approved.
              </p>
            </CardContent>
          </Card>
        )}

        {registration && registration.status === 'rejected' && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-destructive">❌ Registration Rejected</p>
              {registration.rejection_reason && (
                <p className="mt-2 text-sm text-muted-foreground">{registration.rejection_reason}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Registration Button */}
        {!registration && (
          <Button
            className="w-full rounded-full text-lg font-bold"
            size="lg"
            onClick={handleRegister}
            disabled={!canRegister}
          >
            {isEnded ? 'Tournament Ended' : isClosed ? 'Registration Closed' : isFull ? 'Tournament Full' : 'JOIN NOW'}
          </Button>
        )}
      </div>

      {/* Payment & Registration Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={(open) => {
        setShowPaymentDialog(open);
        if (!open) {
          setPaymentStep('info');
          setScreenshotFile(null);
        }
      }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          {paymentStep === 'info' ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-balance">{tournament.name}</DialogTitle>
                <DialogDescription>
                  Tournament Registration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Entry Fee:</span>
                    <span className="text-lg font-bold text-primary">₹{tournament.entry_fee}</span>
                  </div>
                  {paymentSettings && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">UPI ID:</span>
                      <span className="text-sm font-semibold">{paymentSettings.upi_id}</span>
                    </div>
                  )}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Click "Pay Now" to open your UPI app and complete the payment
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayNow}
                  disabled={!paymentSettings}
                >
                  Pay Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Upload Payment Screenshot</DialogTitle>
                <DialogDescription>
                  Complete payment and upload screenshot
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Smart Fallback Message */}
                {upiOpened && paymentSettings && (
                  <div className="rounded-lg border border-info/20 bg-info/10 p-4">
                    <p className="text-sm font-semibold text-info">
                      UPI app did not open automatically?
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Please complete payment manually using:
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 rounded bg-background p-2 text-sm">
                        {paymentSettings.upi_id}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyUpiId}
                      >
                        {copiedUpi ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      After payment, upload screenshot below.
                    </p>
                  </div>
                )}

                {/* In-Game Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="in_game_name">In-Game Name *</Label>
                  <Input
                    id="in_game_name"
                    type="text"
                    placeholder="Enter your in-game name"
                    value={inGameName}
                    onChange={(e) => setInGameName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used to identify you in the tournament
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment Screenshot *</Label>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="cursor-pointer"
                  />
                  {screenshotFile && (
                    <p className="text-sm text-success">
                      ✓ {screenshotFile.name} selected
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max file size: 1MB. Supported formats: JPG, PNG
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSubmitRegistration}
                  disabled={!screenshotFile || uploadingScreenshot || registering}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingScreenshot || registering ? 'Submitting...' : 'Submit Registration'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPaymentStep('info');
                    setScreenshotFile(null);
                  }}
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Booyah Celebration */}
      {showBooyah && winnerPosition && registration && (
        <BooyahCelebration
          position={winnerPosition}
          playerName={registration.in_game_name || registration.username || 'Champion'}
          onClose={() => setShowBooyah(false)}
        />
      )}
    </div>
  );
}
