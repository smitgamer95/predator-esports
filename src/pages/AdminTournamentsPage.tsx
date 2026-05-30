import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { Tournament } from '@/types/database';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';

export default function AdminTournamentsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    entry_fee: '',
    mode: 'Solo' as 'Solo' | 'Duo' | 'Squad',
    prize_1st: '',
    prize_2nd: '',
    prize_3rd: '',
    status: 'active' as 'active' | 'completed' | 'cancelled',
    room_id: '',
    room_password: '',
    max_slots: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    youtube_link: '',
    instagram_link: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadTournaments();
  }, [isAdmin, navigate]);

  const loadTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tournaments');
      console.error(error);
    } else {
      setTournaments(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.entry_fee || !formData.start_date || !formData.start_time) {
      toast.error('Please fill all required fields including date and time');
      return;
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    if (selectedDateTime < new Date()) {
      toast.error('Tournament date and time cannot be in the past');
      return;
    }

    // Validate end time if provided
    let endDateTime = null;
    if (formData.end_date && formData.end_time) {
      endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      if (endDateTime <= selectedDateTime) {
        toast.error('End time must be after start time');
        return;
      }
    }

    // Combine date and time into start_datetime and end_datetime
    const tournamentData = {
      name: formData.name,
      entry_fee: Number(formData.entry_fee) || 0,
      mode: formData.mode,
      prize_1st: Number(formData.prize_1st) || 0,
      prize_2nd: Number(formData.prize_2nd) || 0,
      prize_3rd: Number(formData.prize_3rd) || 0,
      status: formData.status,
      room_id: formData.room_id,
      room_password: formData.room_password,
      max_slots: Number(formData.max_slots) || 100,
      start_datetime: selectedDateTime.toISOString(),
      end_datetime: endDateTime ? endDateTime.toISOString() : null,
      youtube_link: formData.youtube_link || null,
      instagram_link: formData.instagram_link || null,
    };

    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create tournament');
      console.error(error);
      return;
    }

    // Upload thumbnail if provided
    if (thumbnailFile && data) {
      const thumbnailUrl = await uploadThumbnail(data.id);
      if (thumbnailUrl) {
        await supabase
          .from('tournaments')
          .update({ thumbnail_url: thumbnailUrl })
          .eq('id', data.id);
      }
    }

    toast.success('Tournament created successfully');
    setShowCreateDialog(false);
    resetForm();
    loadTournaments();
  };

  const handleUpdate = async () => {
    if (!editingTournament) return;

    if (!formData.start_date || !formData.start_time) {
      toast.error('Please fill date and time fields');
      return;
    }

    // Combine date and time into start_datetime
    const selectedDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
    
    // Validate end time if provided
    let endDateTime = null;
    if (formData.end_date && formData.end_time) {
      endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      if (endDateTime <= selectedDateTime) {
        toast.error('End time must be after start time');
        return;
      }
    }

    const tournamentData = {
      name: formData.name,
      entry_fee: Number(formData.entry_fee) || 0,
      mode: formData.mode,
      prize_1st: Number(formData.prize_1st) || 0,
      prize_2nd: Number(formData.prize_2nd) || 0,
      prize_3rd: Number(formData.prize_3rd) || 0,
      status: formData.status,
      room_id: formData.room_id,
      room_password: formData.room_password,
      max_slots: Number(formData.max_slots) || 100,
      start_datetime: selectedDateTime.toISOString(),
      end_datetime: endDateTime ? endDateTime.toISOString() : null,
      youtube_link: formData.youtube_link || null,
      instagram_link: formData.instagram_link || null,
    };

    // Upload new thumbnail if provided
    let thumbnailUrl = thumbnailPreview;
    if (thumbnailFile) {
      const uploadedUrl = await uploadThumbnail(editingTournament.id);
      if (uploadedUrl) {
        thumbnailUrl = uploadedUrl;
      }
    }

    const { error } = await supabase
      .from('tournaments')
      .update({ ...tournamentData, thumbnail_url: thumbnailUrl })
      .eq('id', editingTournament.id);

    if (error) {
      toast.error('Failed to update tournament');
      console.error(error);
    } else {
      toast.success('Tournament updated successfully');
      setEditingTournament(null);
      resetForm();
      loadTournaments();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This will also delete all registrations and associated files. This action cannot be undone.')) return;

    try {
      // Get all registrations for this tournament to delete screenshots
      const { data: registrations } = await supabase
        .from('tournament_registrations')
        .select('payment_screenshot_url')
        .eq('tournament_id', id);

      // Delete screenshot files from storage
      if (registrations && registrations.length > 0) {
        const filesToDelete = registrations
          .filter(r => r.payment_screenshot_url)
          .map(r => {
            const url = r.payment_screenshot_url!;
            const path = url.split('/uploads/').pop();
            return path;
          })
          .filter(Boolean) as string[];

        if (filesToDelete.length > 0) {
          await supabase.storage
            .from('uploads')
            .remove(filesToDelete);
        }
      }

      // Get tournament to delete thumbnail
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('thumbnail_url')
        .eq('id', id)
        .single();

      // Delete thumbnail from storage
      if (tournament?.thumbnail_url) {
        const thumbnailPath = tournament.thumbnail_url.split('/thumbnails/').pop();
        if (thumbnailPath) {
          await supabase.storage
            .from('thumbnails')
            .remove([thumbnailPath]);
        }
      }

      // Delete registrations (cascade)
      await supabase
        .from('tournament_registrations')
        .delete()
        .eq('tournament_id', id);

      // Delete tournament
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Failed to delete tournament');
        console.error(error);
      } else {
        toast.success('Tournament and all associated data deleted successfully');
        loadTournaments();
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error('An error occurred while deleting tournament');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      entry_fee: '',
      mode: 'Solo',
      prize_1st: '',
      prize_2nd: '',
      prize_3rd: '',
      status: 'active',
      room_id: '',
      room_password: '',
      max_slots: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      youtube_link: '',
      instagram_link: '',
    });
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const openEditDialog = (tournament: Tournament) => {
    setEditingTournament(tournament);
    
    // Extract date and time from start_datetime
    let startDate = '';
    let startTime = '';
    if (tournament.start_datetime) {
      const dt = new Date(tournament.start_datetime);
      startDate = dt.toISOString().split('T')[0]; // YYYY-MM-DD
      startTime = dt.toTimeString().slice(0, 5); // HH:MM
    }

    // Extract date and time from end_datetime
    let endDate = '';
    let endTime = '';
    if (tournament.end_datetime) {
      const dt = new Date(tournament.end_datetime);
      endDate = dt.toISOString().split('T')[0];
      endTime = dt.toTimeString().slice(0, 5);
    }
    
    setFormData({
      name: tournament.name,
      entry_fee: tournament.entry_fee?.toString() || '',
      mode: tournament.mode,
      prize_1st: tournament.prize_1st?.toString() || '',
      prize_2nd: tournament.prize_2nd?.toString() || '',
      prize_3rd: tournament.prize_3rd?.toString() || '',
      status: tournament.status,
      room_id: tournament.room_id || '',
      room_password: tournament.room_password || '',
      max_slots: tournament.max_slots?.toString() || '',
      start_date: startDate,
      start_time: startTime,
      end_date: endDate,
      end_time: endTime,
      youtube_link: tournament.youtube_link || '',
      instagram_link: tournament.instagram_link || '',
    });
    
    // Load existing thumbnail
    if (tournament.thumbnail_url) {
      setThumbnailPreview(tournament.thumbnail_url);
    } else {
      setThumbnailPreview('');
    }
    setThumbnailFile(null);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (jpg, png, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const uploadThumbnail = async (tournamentId: string): Promise<string | null> => {
    if (!thumbnailFile) return null;

    setUploading(true);
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `tournament_${tournamentId}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, thumbnailFile);

    setUploading(false);

    if (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-balance text-4xl font-bold text-foreground">Manage Tournaments</h1>
          <p className="text-pretty text-muted-foreground">Create, edit, and manage tournaments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto md:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-balance">Create New Tournament</DialogTitle>
              <DialogDescription className="text-pretty">Fill in tournament details</DialogDescription>
            </DialogHeader>
            <TournamentForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
              thumbnailPreview={thumbnailPreview}
              handleThumbnailChange={handleThumbnailChange}
              removeThumbnail={removeThumbnail}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading tournaments...</p>
      ) : tournaments.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tournaments yet. Create your first tournament!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="h-full border-border bg-card">
              <CardHeader>
                <CardTitle className="text-balance">{tournament.name}</CardTitle>
                <CardDescription className="text-pretty">
                  {tournament.mode} • ₹{tournament.entry_fee}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1st Prize:</span>
                    <span className="font-semibold text-success">₹{tournament.prize_1st}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2nd Prize:</span>
                    <span className="font-semibold text-warning">₹{tournament.prize_2nd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3rd Prize:</span>
                    <span className="font-semibold text-info">₹{tournament.prize_3rd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slots:</span>
                    <span className="font-semibold">
                      {tournament.filled_slots || 0}/{tournament.max_slots || 100}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold capitalize status-${tournament.status}`}>
                      {tournament.status}
                    </span>
                  </div>
                  {tournament.room_id && (
                    <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3">
                      <p className="text-xs font-semibold text-primary">Room Details:</p>
                      <p className="text-xs text-primary">ID: {tournament.room_id}</p>
                      <p className="text-xs text-primary">Pass: {tournament.room_password}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(tournament)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto md:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-balance">Edit Tournament</DialogTitle>
                        <DialogDescription className="text-pretty">Update tournament details</DialogDescription>
                      </DialogHeader>
                      <TournamentForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleUpdate}
                        onCancel={() => setEditingTournament(null)}
                        thumbnailPreview={thumbnailPreview}
                        handleThumbnailChange={handleThumbnailChange}
                        removeThumbnail={removeThumbnail}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(tournament.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TournamentForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  thumbnailPreview,
  handleThumbnailChange,
  removeThumbnail,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  thumbnailPreview: string;
  handleThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeThumbnail: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Tournament Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Free Fire Championship"
          className="bg-input"
        />
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail">Tournament Thumbnail</Label>
        {thumbnailPreview ? (
          <div className="relative inline-block">
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              className="h-32 w-full max-w-md rounded-lg border border-border object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -right-2 -top-2"
              onClick={removeThumbnail}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-8">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No thumbnail uploaded</p>
            </div>
          </div>
        )}
        <Input
          id="thumbnail"
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="bg-input"
        />
        <p className="text-sm text-muted-foreground">
          Max 5MB, recommended: 1200x600px (jpg, png, webp)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mode">Mode *</Label>
          <Select
            value={formData.mode}
            onValueChange={(value) => setFormData({ ...formData, mode: value })}
          >
            <SelectTrigger className="bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Solo">Solo</SelectItem>
              <SelectItem value="Duo">Duo</SelectItem>
              <SelectItem value="Squad">Squad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry_fee">Entry Fee (₹) *</Label>
          <Input
            id="entry_fee"
            type="number"
            value={formData.entry_fee}
            onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
            placeholder="Enter entry fee (e.g., 50)"
            className="bg-input"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="prize_1st">1st Prize (₹) *</Label>
          <Input
            id="prize_1st"
            type="number"
            value={formData.prize_1st}
            onChange={(e) => setFormData({ ...formData, prize_1st: e.target.value })}
            placeholder="Enter 1st prize"
            className="bg-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prize_2nd">2nd Prize (₹) *</Label>
          <Input
            id="prize_2nd"
            type="number"
            value={formData.prize_2nd}
            onChange={(e) => setFormData({ ...formData, prize_2nd: e.target.value })}
            placeholder="Enter 2nd prize"
            className="bg-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prize_3rd">3rd Prize (₹) *</Label>
          <Input
            id="prize_3rd"
            type="number"
            value={formData.prize_3rd}
            onChange={(e) => setFormData({ ...formData, prize_3rd: e.target.value })}
            placeholder="Enter 3rd prize"
            className="bg-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger className="bg-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_slots">Maximum Slots *</Label>
        <Input
          id="max_slots"
          type="number"
          value={formData.max_slots}
          onChange={(e) => setFormData({ ...formData, max_slots: Number(e.target.value) })}
          className="bg-input"
          min={1}
        />
        <p className="text-sm text-muted-foreground">
          Maximum number of players allowed
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="bg-input"
          />
          <p className="text-sm text-muted-foreground">
            Tournament start date
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time *</Label>
          <Input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="bg-input"
          />
          <p className="text-sm text-muted-foreground">
            Tournament start time
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            min={formData.start_date || new Date().toISOString().split('T')[0]}
            className="bg-input"
          />
          <p className="text-sm text-muted-foreground">
            Tournament end date (registration closes)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time (Optional)</Label>
          <Input
            id="end_time"
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="bg-input"
          />
          <p className="text-sm text-muted-foreground">
            Tournament end time (registration closes)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_slots">Max Slots</Label>
        <Input
          id="max_slots"
          type="number"
          value={formData.max_slots}
          onChange={(e) => setFormData({ ...formData, max_slots: e.target.value })}
          placeholder="Enter max slots (e.g., 100)"
          className="bg-input"
        />
        <p className="text-sm text-muted-foreground">
          Maximum number of players (leave empty for 100)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="room_id">Room ID (Optional)</Label>
        <Input
          id="room_id"
          value={formData.room_id}
          onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
          placeholder="e.g., 123456789"
          className="bg-input"
        />
        <p className="text-sm text-muted-foreground">
          Game room ID - visible only to approved players
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="room_password">Room Password (Optional)</Label>
        <Input
          id="room_password"
          value={formData.room_password}
          onChange={(e) => setFormData({ ...formData, room_password: e.target.value })}
          placeholder="e.g., pass1234"
          className="bg-input"
        />
        <p className="text-sm text-muted-foreground">
          Game room password - visible only to approved players
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="youtube_link">YouTube Live Link (Optional)</Label>
          <Input
            id="youtube_link"
            value={formData.youtube_link}
            onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
            placeholder="https://youtube.com/live/..."
            className="bg-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_link">Instagram Live Link (Optional)</Label>
          <Input
            id="instagram_link"
            value={formData.instagram_link}
            onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
            placeholder="https://instagram.com/..."
            className="bg-input"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onSubmit} className="flex-1">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
