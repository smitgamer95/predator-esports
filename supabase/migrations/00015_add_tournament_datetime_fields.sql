-- Add date and time fields to tournaments table
ALTER TABLE tournaments
ADD COLUMN start_date DATE,
ADD COLUMN start_time TIME,
ADD COLUMN start_datetime TIMESTAMP WITH TIME ZONE;

-- Set default values for existing tournaments (7 days from now at 7:00 PM)
UPDATE tournaments
SET 
  start_date = CURRENT_DATE + INTERVAL '7 days',
  start_time = '19:00:00'::TIME,
  start_datetime = (CURRENT_DATE + INTERVAL '7 days')::TIMESTAMP + '19:00:00'::TIME
WHERE start_datetime IS NULL;