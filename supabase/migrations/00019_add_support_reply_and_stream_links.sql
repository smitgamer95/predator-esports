-- Add reply and status to support_messages
ALTER TABLE support_messages
ADD COLUMN IF NOT EXISTS reply TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Add live stream links to tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS youtube_link TEXT,
ADD COLUMN IF NOT EXISTS instagram_link TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON support_messages(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);