import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getTournaments } from '@/services/tournament';
import type { Tournament } from '@/types/database';
import { Trophy, Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/dateUtils';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setLoading(true);
    const data = await getTournaments('active');
    setTournaments(data);
    setLoading(false);
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (filter === 'all') return true;
    return t.mode === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-balance text-3xl font-bold text-foreground">Active Tournaments</h1>
        <p className="text-pretty text-sm text-muted-foreground">Browse and join exciting Free Fire tournaments</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === 'Solo' ? 'default' : 'outline'}
          onClick={() => setFilter('Solo')}
          size="sm"
        >
          Solo
        </Button>
        <Button
          variant={filter === 'Duo' ? 'default' : 'outline'}
          onClick={() => setFilter('Duo')}
          size="sm"
        >
          Duo
        </Button>
        <Button
          variant={filter === 'Squad' ? 'default' : 'outline'}
          onClick={() => setFilter('Squad')}
          size="sm"
        >
          Squad
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading tournaments...</p>
      ) : filteredTournaments.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No tournaments available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => {
            const filledSlots = tournament.filled_slots || 0;
            const maxSlots = tournament.max_slots || 100;
            const progressPercentage = (filledSlots / maxSlots) * 100;
            const isFull = filledSlots >= maxSlots;

            return (
              <Card key={tournament.id} className="h-full overflow-hidden border-border bg-card shadow-lg transition-all hover:border-primary hover:shadow-primary/20">
                {/* Thumbnail Image */}
                {tournament.thumbnail_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={tournament.thumbnail_url}
                      alt={tournament.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader className="space-y-3 p-4">
                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="bg-primary/20 text-primary">
                      {tournament.mode}
                    </Badge>
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      📺 Live
                    </Badge>
                  </div>

                  {/* Tournament Name */}
                  <CardTitle className="text-balance text-lg leading-tight">{tournament.name}</CardTitle>

                  {/* Date & Time */}
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(tournament.start_datetime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(tournament.start_datetime)}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 p-4 pt-0">
                  {/* Entry Fee & Prize Pool */}
                  <div className="flex items-center justify-between rounded-lg bg-background p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="text-lg font-bold text-primary">₹{tournament.entry_fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Prize Pool</p>
                      <p className="text-lg font-bold text-success">₹{tournament.prize_1st + tournament.prize_2nd + tournament.prize_3rd}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      {filledSlots}/{maxSlots} players joined
                    </p>
                  </div>

                  {/* Join Button */}
                  <Button 
                    asChild 
                    className="w-full rounded-full text-base font-semibold" 
                    size="lg"
                    disabled={isFull}
                  >
                    <Link to={`/tournaments/${tournament.id}`}>
                      {isFull ? 'FULL' : 'JOIN NOW'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
