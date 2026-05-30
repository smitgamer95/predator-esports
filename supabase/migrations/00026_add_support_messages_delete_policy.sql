-- Add delete policy for support_messages table
-- Only admins can delete support messages

CREATE POLICY "Only admins can delete support messages"
ON public.support_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
