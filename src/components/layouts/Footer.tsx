import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Youtube, Instagram } from 'lucide-react';
import { getAdminSettings } from '@/services/tournament';
import type { AdminSettings } from '@/types/database';

export function Footer() {
  const [tapCount, setTapCount] = useState(0);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tapCount === 2) {
      navigate('/admin-login');
      setTapCount(0);
    }
  }, [tapCount, navigate]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getAdminSettings();
    setSettings(data);
  };

  const handleFooterClick = () => {
    setTapCount((prev) => prev + 1);
    setTimeout(() => setTapCount(0), 300);
  };

  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="container mx-auto px-4 text-center">
        {/* Social Media Links */}
        <div className="mb-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Follow Us</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href={settings?.youtube_url || 'https://youtube.com/@predator.e-sports_official'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Youtube className="h-5 w-5" />
              YouTube
            </a>
            <a
              href={settings?.instagram_url || 'https://www.instagram.com/predator.esports.gg'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Instagram className="h-5 w-5" />
              Instagram
            </a>
          </div>
        </div>

        <p
          className="cursor-default text-sm text-muted-foreground"
          onClick={handleFooterClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleFooterClick();
          }}
        >
          © 2026 Predator E-Sports
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <a href="/privacy-policy" className="hover:text-primary">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="/terms-conditions" className="hover:text-primary">
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>
  );
}
