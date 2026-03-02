-- Add missing storage policies (skip existing ones)
DO $$
BEGIN
  -- Upload policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload branding images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload branding images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'branding');
  END IF;

  -- Update policy  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update branding images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can update branding images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'branding');
  END IF;

  -- Delete policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete branding images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can delete branding images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'branding');
  END IF;
END $$;