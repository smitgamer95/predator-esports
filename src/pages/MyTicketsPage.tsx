import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { ArrowLeft, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type Ticket = {
  id: string;
  name: string;
  email: string;
  message: string;
  reply: string | null;
  status: 'open' | 'replied' | 'closed';
  replied_at: string | null;
  created_at: string;
};

export default function MyTicketsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTickets();
  }, [user, navigate]);

  const loadTickets = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('email', user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500/20 text-blue-500">Open</Badge>;
      case 'replied':
        return <Badge className="bg-green-500/20 text-green-500">Replied</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500/20 text-gray-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-balance text-2xl font-bold">My Tickets</h1>
            <p className="text-sm text-muted-foreground">View your support tickets and replies</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">No tickets found</p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Submit a support request from the Contact page
              </p>
              <Button className="mt-4" onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-balance text-lg">Ticket #{ticket.id.slice(0, 8)}</CardTitle>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Your Message */}
                  <div>
                    <p className="mb-2 text-sm font-semibold">Your Message:</p>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-pretty text-sm">{ticket.message}</p>
                    </div>
                  </div>

                  {/* Admin Reply */}
                  {ticket.reply && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <p className="text-sm font-semibold text-success">Admin Reply:</p>
                        {ticket.replied_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(ticket.replied_at)}
                          </span>
                        )}
                      </div>
                      <div className="rounded-lg bg-success/10 p-3">
                        <p className="text-pretty text-sm">{ticket.reply}</p>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {!ticket.reply && ticket.status === 'open' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <p>Waiting for admin response...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
