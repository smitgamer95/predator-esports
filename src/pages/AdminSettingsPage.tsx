import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import type { AdminSettings } from '@/types/database';
import { toast } from 'sonner';
import { Upload, X, Lock } from 'lucide-react';
import { changeAdminPassword } from '@/services/password';

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    upi_id: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    emailjs_public_key: '',
    emailjs_service_id: '',
    emailjs_template_id: '',
    youtube_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadSettings();
  }, [isAdmin, navigate]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } else if (data) {
      setSettings(data);
      setFormData({
        upi_id: data.upi_id || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        logo_url: data.logo_url || '',
        emailjs_public_key: data.emailjs_public_key || '',
        emailjs_service_id: data.emailjs_service_id || '',
        emailjs_template_id: data.emailjs_template_id || '',
        youtube_url: data.youtube_url || 'https://youtube.com/@predator.e-sports_official',
        instagram_url: data.instagram_url || 'https://www.instagram.com/predator.esports.gg',
      });
      if (data.logo_url) {
        setLogoPreview(data.logo_url);
      }
    }
    setLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for logo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return formData.logo_url || null;

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload logo');
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setUploading(false);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
      setUploading(false);
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Upload logo if changed
    let logoUrl = formData.logo_url;
    if (logoFile) {
      const uploadedUrl = await uploadLogo();
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      } else {
        setSaving(false);
        return;
      }
    }

    const dataToSave = {
      ...formData,
      logo_url: logoUrl,
    };

    if (settings) {
      // Update existing settings
      const { error } = await supabase
        .from('admin_settings')
        .update(dataToSave)
        .eq('id', settings.id);

      if (error) {
        toast.error('Failed to update settings');
        console.error(error);
      } else {
        toast.success('Settings updated successfully');
        setLogoFile(null);
        loadSettings();
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('admin_settings')
        .insert([dataToSave]);

      if (error) {
        toast.error('Failed to create settings');
        console.error(error);
      } else {
        toast.success('Settings created successfully');
        setLogoFile(null);
        loadSettings();
      }
    }

    setSaving(false);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setFormData({ ...formData, logo_url: '' });
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setChangingPassword(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error('User not found');
      setChangingPassword(false);
      return;
    }

    const result = await changeAdminPassword(
      userData.user.id,
      passwordData.currentPassword,
      passwordData.newPassword
    );

    if (result.success) {
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      toast.error(result.error || 'Failed to change password');
    }

    setChangingPassword(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-balance text-4xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-pretty text-muted-foreground">Configure platform settings, branding, and integrations</p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading settings...</p>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Logo Upload */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-balance">Platform Logo</CardTitle>
              <CardDescription className="text-pretty">
                Upload your platform logo (max 5MB, recommended: 200x50px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-16 max-w-xs rounded-lg border border-border object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -right-2 -top-2"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-8">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No logo uploaded</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="logo">Upload Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="bg-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment & Contact Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-balance">Payment & Contact Information</CardTitle>
              <CardDescription className="text-pretty">
                Configure UPI ID and contact details for users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upi_id">UPI ID *</Label>
                <Input
                  id="upi_id"
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  placeholder="yourname@upi"
                  className="bg-input"
                />
                <p className="text-sm text-muted-foreground">
                  This UPI ID will be used for tournament entry fee payments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="contact@predator.com"
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone *</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+91-1234567890"
                  className="bg-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* EmailJS Configuration */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-balance">EmailJS Configuration</CardTitle>
              <CardDescription className="text-pretty">
                Configure EmailJS for OTP email delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailjs_public_key">EmailJS Public Key *</Label>
                <Input
                  id="emailjs_public_key"
                  value={formData.emailjs_public_key}
                  onChange={(e) => setFormData({ ...formData, emailjs_public_key: e.target.value })}
                  placeholder="DkCe2-sYkG00m9ZaK"
                  className="bg-input"
                />
                <p className="text-sm text-muted-foreground">
                  Get this from EmailJS dashboard → Account → API Keys
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailjs_service_id">EmailJS Service ID *</Label>
                <Input
                  id="emailjs_service_id"
                  value={formData.emailjs_service_id}
                  onChange={(e) => setFormData({ ...formData, emailjs_service_id: e.target.value })}
                  placeholder="service_xxxxxxx"
                  className="bg-input"
                />
                <p className="text-sm text-muted-foreground">
                  Get this from EmailJS dashboard → Email Services
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailjs_template_id">EmailJS Template ID *</Label>
                <Input
                  id="emailjs_template_id"
                  value={formData.emailjs_template_id}
                  onChange={(e) => setFormData({ ...formData, emailjs_template_id: e.target.value })}
                  placeholder="template_xxxxxxx"
                  className="bg-input"
                />
                <p className="text-sm text-muted-foreground">
                  Get this from EmailJS dashboard → Email Templates
                </p>
              </div>

              <div className="rounded-lg border border-info/20 bg-info/10 p-4">
                <p className="text-sm text-info">
                  <strong>Note:</strong> After updating EmailJS settings, test the OTP system by registering a new user to ensure emails are being sent correctly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-balance">Social Media Links</CardTitle>
              <CardDescription className="text-pretty">
                Configure YouTube and Instagram links for live streaming and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube Channel URL *</Label>
                <Input
                  id="youtube_url"
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@your-channel"
                  className="bg-input"
                />
                <p className="text-sm text-muted-foreground">
                  Primary platform for live streaming tournaments
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram Profile URL *</Label>
                <Input
                  id="instagram_url"
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/your-profile"
                  className="bg-input"
                />
                <p className="text-sm text-muted-foreground">
                  For match updates, highlights, and announcements
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
                <p className="text-sm text-primary">
                  <strong>Strategy:</strong> YouTube is promoted as the primary platform for live streaming. Instagram is used for updates and highlights only.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Password Change */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-balance flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Admin Password
              </CardTitle>
              <CardDescription className="text-pretty">
                Update your admin password for enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="rounded-lg border border-warning/20 bg-warning/10 p-4">
                <p className="text-sm text-warning">
                  <strong>Security Note:</strong> Your password will be securely hashed and stored. Make sure to remember your new password as it cannot be recovered.
                </p>
              </div>

              <Button 
                onClick={handlePasswordChange} 
                className="w-full" 
                disabled={changingPassword}
                variant="secondary"
              >
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full" disabled={saving || uploading}>
            {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save All Settings'}
          </Button>
        </div>
      )}
    </div>
  );
}
