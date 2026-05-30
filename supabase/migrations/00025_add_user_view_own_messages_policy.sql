-- Add policy for users to view their own messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.support_messages;

CREATE POLICY "Users can view their own messages" ON public.support_messages
  FOR SELECT USING (
    email IN (SELECT email FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );