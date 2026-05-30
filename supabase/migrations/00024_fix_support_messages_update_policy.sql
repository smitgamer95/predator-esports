-- Add UPDATE policy for admins on support_messages
DROP POLICY IF EXISTS "Admins can update support messages" ON public.support_messages;

CREATE POLICY "Admins can update support messages" ON public.support_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );