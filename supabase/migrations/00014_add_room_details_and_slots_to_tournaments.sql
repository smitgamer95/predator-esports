-- Add room details and slot system to tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS room_id TEXT,
ADD COLUMN IF NOT EXISTS room_password TEXT,
ADD COLUMN IF NOT EXISTS max_slots INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;

-- Create function to increment filled slots when registration is approved
CREATE OR REPLACE FUNCTION increment_tournament_slots()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If status changed to approved, increment filled_slots
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE tournaments
    SET filled_slots = filled_slots + 1
    WHERE id = NEW.tournament_id;
  END IF;
  
  -- If status changed from approved to rejected/pending, decrement filled_slots
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE tournaments
    SET filled_slots = GREATEST(filled_slots - 1, 0)
    WHERE id = NEW.tournament_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for slot management
DROP TRIGGER IF EXISTS manage_tournament_slots ON tournament_registrations;
CREATE TRIGGER manage_tournament_slots
AFTER UPDATE ON tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION increment_tournament_slots();

-- Update existing tournaments to have default values
UPDATE tournaments
SET max_slots = 100, filled_slots = 0
WHERE max_slots IS NULL OR filled_slots IS NULL;