import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Tournament, TournamentRegistration } from '@/types/database';
import { toast } from 'sonner';
import { Trophy, Users, RotateCcw, X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type RegistrationWithProfile = TournamentRegistration & {
  profiles: { name: string; game_name: string; email: string | null } | null;
};

export default function AdminLiveTournamentPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [registrations, setRegistrations] = useState<RegistrationWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedForWinner, setSelectedForWinner] = useState<{ first: string | null; second: string | null; third: string | null }>({
    first: null,
    second: null,
    third: null,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadTournaments();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (selectedTournamentId) {
      loadRegistrations();
    }
  }, [selectedTournamentId]);

  const loadTournaments = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .order('start_datetime', { ascending: true });

    if (data) {
      setTournaments(data);
    }
  };

  const loadRegistrations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tournament_registrations')
      .select(`
        *,
        profiles:user_id (name, game_name, email)
      `)
      .eq('tournament_id', selectedTournamentId)
      .eq('status', 'approved')
      .order('slot_number', { ascending: true });

    if (data) {
      setRegistrations(data as RegistrationWithProfile[]);
    }
    setLoading(false);
  };

  const handleEliminate = async (registrationId: string) => {
    const { error } = await supabase
      .from('tournament_registrations')
      .update({ eliminated: true })
      .eq('id', registrationId);

    if (error) {
      toast.error('Failed to eliminate player');
    } else {
      toast.success('Player eliminated');
      loadRegistrations();
    }
  };

  const handleUndoEliminate = async (registrationId: string) => {
    const { error } = await supabase
      .from('tournament_registrations')
      .update({ eliminated: false })
      .eq('id', registrationId);

    if (error) {
      toast.error('Failed to undo elimination');
    } else {
      toast.success('Player restored');
      loadRegistrations();
    }
  };

  // Animation functions for different winner positions
  const triggerFirstPlaceAnimation = () => {
    // Gold confetti explosion for 1st place
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#FFD700', '#FFA500', '#FFFF00'],
    });
  };

  const triggerSecondPlaceAnimation = () => {
    // Silver sparkles for 2nd place
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#C0C0C0', '#D3D3D3', '#E8E8E8', '#A9A9A9'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#C0C0C0', '#D3D3D3', '#E8E8E8', '#A9A9A9'],
      });
    }, 250);
  };

  const triggerThirdPlaceAnimation = () => {
    // Bronze stars for 3rd place
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#CD7F32', '#B87333', '#8B4513', '#D2691E'],
      shapes: ['star'],
      scalar: 1.2,
      zIndex: 9999,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#CD7F32', '#B87333', '#8B4513', '#D2691E'],
        shapes: ['star'],
        zIndex: 9999,
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#CD7F32', '#B87333', '#8B4513', '#D2691E'],
        shapes: ['star'],
        zIndex: 9999,
      });
    }, 400);
  };

  const handleSetWinner = async (position: 'first' | 'second' | 'third', userId: string) => {
    const positionNumber = position === 'first' ? 1 : position === 'second' ? 2 : 3;
    
    // Update winner_position in database
    const { error } = await supabase
      .from('tournament_registrations')
      .update({ winner_position: positionNumber })
      .eq('tournament_id', selectedTournamentId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to set winner');
      console.error(error);
      return;
    }

    setSelectedForWinner(prev => ({
      ...prev,
      [position]: userId,
    }));
    
    // Trigger animation based on position
    if (position === 'first') {
      triggerFirstPlaceAnimation();
    } else if (position === 'second') {
      triggerSecondPlaceAnimation();
    } else {
      triggerThirdPlaceAnimation();
    }
    
    toast.success(`Set as ${positionNumber}${positionNumber === 1 ? 'st' : positionNumber === 2 ? 'nd' : 'rd'} place winner!`);
    loadRegistrations(); // Reload to show updated data
  };

  const handleCompleteTournament = async () => {
    if (!selectedForWinner.first || !selectedForWinner.second || !selectedForWinner.third) {
      toast.error('Please select all three winners');
      return;
    }

    const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);
    if (!selectedTournament) return;

    // Save winners to tournament_results
    const { error: resultError } = await supabase
      .from('tournament_results')
      .insert({
        tournament_id: selectedTournamentId,
        first_place_user_id: selectedForWinner.first,
        second_place_user_id: selectedForWinner.second,
        third_place_user_id: selectedForWinner.third,
      });

    if (resultError) {
      toast.error('Failed to save results');
      return;
    }

    // Update tournament status
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ status: 'completed' })
      .eq('id', selectedTournamentId);

    if (updateError) {
      toast.error('Failed to complete tournament');
    } else {
      toast.success('Tournament completed successfully!');
      setShowCompleteDialog(false);
      setSelectedTournamentId('');
      setSelectedForWinner({ first: null, second: null, third: null });
      loadTournaments();
    }
  };

  const activePlayers = registrations.filter(r => !r.eliminated);
  const eliminatedPlayers = registrations.filter(r => r.eliminated);
  const canSelectWinners = activePlayers.length === 3;
  
  // Get winners with full details
  const winners = registrations
    .filter(r => r.winner_position)
    .sort((a, b) => (a.winner_position || 0) - (b.winner_position || 0));

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Professional Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">Live Tournament Control</h1>
              <p className="text-pretty text-sm text-muted-foreground">Real-time tournament management and player control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Tournament Selection */}
        <Card className="mb-6 border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/30 p-4">
            <CardTitle className="text-balance flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Select Tournament
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Select value={selectedTournamentId} onValueChange={setSelectedTournamentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a tournament..." />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map(tournament => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name} - {tournament.mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

      {selectedTournamentId && (
        <>
          {/* Professional Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Players</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{activePlayers.length}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Eliminated</p>
                    <p className="mt-2 text-3xl font-bold text-destructive">{eliminatedPlayers.length}</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20">
                    <X className="h-7 w-7 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Winners</p>
                    <p className="mt-2 text-3xl font-bold text-yellow-500">{winners.length}/3</p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/20">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Winner Selection (when 3 players remain) */}
          {canSelectWinners && (
            <Card className="mb-6 border-success/20 bg-success/5">
              <CardHeader>
                <CardTitle className="text-balance flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-warning" />
                  Select Winners (Top 3 Remaining)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activePlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                    <div>
                      <p className="font-semibold">{player.username || player.profiles?.name}</p>
                      <p className="text-sm text-muted-foreground">Slot #{player.slot_number}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedForWinner.first === player.user_id ? 'default' : 'outline'}
                        onClick={() => handleSetWinner('first', player.user_id)}
                      >
                        🥇 1st
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedForWinner.second === player.user_id ? 'default' : 'outline'}
                        onClick={() => handleSetWinner('second', player.user_id)}
                      >
                        🥈 2nd
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedForWinner.third === player.user_id ? 'default' : 'outline'}
                        onClick={() => handleSetWinner('third', player.user_id)}
                      >
                        🥉 3rd
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={!selectedForWinner.first || !selectedForWinner.second || !selectedForWinner.third}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Complete Tournament
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Professional Winners Section */}
          {winners.length > 0 && (
            <Card className="mb-6 overflow-hidden border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-yellow-500/10 to-yellow-500/5 shadow-lg">
              <CardHeader className="border-b border-yellow-500/20 bg-yellow-500/10 p-4">
                <CardTitle className="text-balance flex items-center gap-2 text-xl">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Tournament Winners ({winners.length}/3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="group relative overflow-hidden rounded-xl border-2 border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 p-5 shadow-md transition-all hover:border-yellow-500/60 hover:shadow-lg"
                  >
                    <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-yellow-500/10 to-transparent" />
                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 text-4xl shadow-inner">
                            {winner.winner_position === 1 && '🥇'}
                            {winner.winner_position === 2 && '🥈'}
                            {winner.winner_position === 3 && '🥉'}
                          </div>
                          <div>
                            <p className="text-xl font-bold text-yellow-500">
                              {winner.winner_position === 1 && '1st Place'}
                              {winner.winner_position === 2 && '2nd Place'}
                              {winner.winner_position === 3 && '3rd Place'}
                            </p>
                            <p className="text-sm text-muted-foreground">Champion</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/30 px-3 py-1 text-sm font-semibold text-yellow-500">
                          Slot #{winner.slot_number}
                        </Badge>
                      </div>
                      <div className="grid gap-3 rounded-lg bg-background/50 p-4 text-sm backdrop-blur-sm">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 font-semibold text-muted-foreground">Name:</span>
                          <span className="min-w-0 truncate font-bold">{winner.username}</span>
                        </div>
                        {winner.in_game_name && (
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 font-semibold text-muted-foreground">In-Game:</span>
                            <span className="min-w-0 truncate font-bold">{winner.in_game_name}</span>
                          </div>
                        )}
                        {winner.gamer_id && (
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 font-semibold text-muted-foreground">Gamer ID:</span>
                            <span className="min-w-0 truncate font-mono font-bold">{winner.gamer_id}</span>
                          </div>
                        )}
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 font-semibold text-muted-foreground">Phone:</span>
                          <span className="min-w-0 truncate font-mono font-bold">{winner.phone}</span>
                        </div>
                        {winner.profiles?.email && (
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 font-semibold text-muted-foreground">Email:</span>
                            <span className="min-w-0 truncate font-mono font-bold">{winner.profiles.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Professional Active Players Section */}
          <Card className="mb-6 overflow-hidden border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 p-4">
              <CardTitle className="text-balance flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Active Players ({activePlayers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading players...</p>
                  </div>
                </div>
              ) : activePlayers.length === 0 ? (
                <div className="rounded-lg bg-muted/30 py-12 text-center">
                  <Users className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No active players</p>
                </div>
              ) : (
                activePlayers.map(player => (
                  <div key={player.id} className="group flex flex-col gap-3 rounded-lg border border-border bg-gradient-to-r from-background to-muted/20 p-4 transition-all hover:border-primary/50 hover:shadow-md md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ring-2 ring-primary/20">
                        #{player.slot_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground">{player.in_game_name || player.username || player.profiles?.name}</p>
                        <p className="text-sm text-muted-foreground">{player.profiles?.game_name || 'Player'}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {/* Show winner buttons when ≤3 active players */}
                      {activePlayers.length <= 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-500 bg-yellow-500/10 font-semibold text-yellow-500 hover:bg-yellow-500/20"
                            onClick={() => handleSetWinner('first', player.user_id)}
                          >
                            🥇 1st
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-400 bg-gray-400/10 font-semibold hover:bg-gray-400/20"
                            onClick={() => handleSetWinner('second', player.user_id)}
                          >
                            🥈 2nd
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-600 bg-orange-600/10 font-semibold text-orange-600 hover:bg-orange-600/20"
                            onClick={() => handleSetWinner('third', player.user_id)}
                          >
                            🥉 3rd
                          </Button>
                        </>
                      )}
                      {/* Always show eliminate button, but disable when only 1 player */}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="font-semibold shadow-sm"
                        onClick={() => handleEliminate(player.id)}
                        disabled={activePlayers.length <= 1}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Eliminate
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Professional Eliminated Players Section */}
          {eliminatedPlayers.length > 0 && (
            <Card className="overflow-hidden border-destructive/30 bg-card shadow-sm">
              <CardHeader className="border-b border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10 p-4">
                <CardTitle className="text-balance flex items-center gap-2 text-lg">
                  <X className="h-5 w-5 text-destructive" />
                  Eliminated Players ({eliminatedPlayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {eliminatedPlayers.map(player => (
                  <div key={player.id} className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-gradient-to-r from-destructive/5 to-destructive/10 p-4 opacity-75 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/20 font-bold text-destructive ring-2 ring-destructive/30">
                        #{player.slot_number}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground line-through">{player.username || player.profiles?.name}</p>
                        <p className="text-sm text-muted-foreground">{player.profiles?.game_name || 'Eliminated'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-primary font-semibold text-primary hover:bg-primary/10"
                      onClick={() => handleUndoEliminate(player.id)}
                    >
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Restore
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

        {/* Complete Tournament Dialog */}
        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Tournament?</AlertDialogTitle>
              <AlertDialogDescription>
                This will save the winners and mark the tournament as completed. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCompleteTournament}>
                Complete Tournament
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
