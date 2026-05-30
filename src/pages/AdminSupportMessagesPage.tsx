import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { SupportMessage } from '@/types/database';
import { toast } from 'sonner';
import { Mail, MessageSquare, Send, Trash2 } from 'lucide-react';

export default function AdminSupportMessagesPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadMessages();
  }, [isAdmin, navigate]);

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load messages');
      console.error(error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleReply = (message: SupportMessage) => {
    setSelectedMessage(message);
    setReplyText(message.reply || '');
    setShowReplyDialog(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .update({
          reply: replyText,
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast.success('Reply sent successfully');
      setShowReplyDialog(false);
      setSelectedMessage(null);
      setReplyText('');
      loadMessages();
    } catch (error) {
      toast.error('Failed to send reply');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsClosed = async (id: string) => {
    const { error } = await supabase
      .from('support_messages')
      .update({ status: 'closed' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Ticket closed');
      loadMessages();
    }
  };

  const handleDeleteClick = (id: string) => {
    setMessageToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .delete()
        .eq('id', messageToDelete);

      if (error) {
        console.error('Delete error:', error);
        toast.error(`Failed to delete ticket: ${error.message}`);
      } else {
        toast.success('Ticket deleted successfully');
        loadMessages();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setShowDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const openMessages = messages.filter(m => m.status === 'open' || m.status === 'pending');
  const repliedMessages = messages.filter(m => m.status === 'replied');
  const closedMessages = messages.filter(m => m.status === 'closed' || m.status === 'resolved');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="mb-2 text-balance text-3xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Manage and reply to user support messages
        </p>
      </div>

      {loading ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading messages...</p>
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No support messages yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Messages */}
          {openMessages.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-warning">Pending ({openMessages.length})</h2>
              <div className="grid gap-4">
                {openMessages.map((message) => (
                  <Card key={message.id} className="border-warning/20 bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-balance text-lg">{message.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                        </div>
                        <Badge variant="secondary" className="bg-warning/20 text-warning">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Message:</p>
                        <p className="text-pretty text-sm">{message.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Received: {new Date(message.created_at).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() => handleReply(message)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMarkAsClosed(message.id)}
                        >
                          Mark as Closed
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Replied Messages */}
          {repliedMessages.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-primary">Replied ({repliedMessages.length})</h2>
              <div className="grid gap-4">
                {repliedMessages.map((message) => (
                  <Card key={message.id} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-balance text-lg">{message.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          Replied
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Message:</p>
                        <p className="text-pretty text-sm">{message.message}</p>
                      </div>
                      {message.reply && (
                        <div className="rounded-lg bg-primary/10 p-3">
                          <p className="text-sm font-semibold text-primary">Your Reply:</p>
                          <p className="text-pretty text-sm">{message.reply}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Replied: {message.replied_at ? new Date(message.replied_at).toLocaleString() : 'N/A'}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReply(message)}
                        >
                          Edit Reply
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMarkAsClosed(message.id)}
                        >
                          Mark as Closed
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Closed Messages */}
          {closedMessages.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-success">Closed ({closedMessages.length})</h2>
              <div className="grid gap-4">
                {closedMessages.map((message) => (
                  <Card key={message.id} className="border-border bg-card opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-balance text-lg">{message.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                        </div>
                        <Badge variant="secondary" className="bg-success/20 text-success">
                          Closed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Message:</p>
                        <p className="text-pretty text-sm">{message.message}</p>
                      </div>
                      {message.reply && (
                        <div className="rounded-lg bg-muted p-3">
                          <p className="text-sm font-semibold">Reply:</p>
                          <p className="text-pretty text-sm">{message.reply}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleDeleteClick(message.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Ticket
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to Support Message</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-semibold">Original Message:</p>
              <p className="text-pretty text-sm">{selectedMessage?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-32"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Send Reply'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowReplyDialog(false);
                  setSelectedMessage(null);
                  setReplyText('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Support Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the support ticket and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
