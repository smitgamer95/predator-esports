-- Add social media links to admin_settings table
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS youtube_url TEXT DEFAULT 'https://youtube.com/@predator.e-sports_official';
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT 'https://www.instagram.com/predator.esports.gg';