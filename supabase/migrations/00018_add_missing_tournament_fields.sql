-- Add missing fields to tournament_registrations
ALTER TABLE tournament_registrations 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS slot_number INTEGER,
  ADD COLUMN IF NOT EXISTS eliminated BOOLEAN DEFAULT FALSE;

-- Add end_datetime to tournaments
ALTER TABLE tournaments 
  ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMPTZ;

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on support_messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert support messages
CREATE POLICY "Anyone can submit support messages"
  ON support_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only admins can view support messages
CREATE POLICY "Admins can view support messages"
  ON support_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );