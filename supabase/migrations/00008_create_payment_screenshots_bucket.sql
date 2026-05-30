
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true);

CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

CREATE POLICY "Authenticated users can upload payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Users can update their own payment screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can delete payment screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'::public.user_role)
);
