-- Fix storage policies: remove broad authenticated user policies, keep admin-only
DROP POLICY IF EXISTS "Authenticated users can upload branding images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding images" ON storage.objects;

-- Create contact_submissions table for independent rate limiting
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only admins can read contact submissions (for audit), anyone can insert (for rate tracking)
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));