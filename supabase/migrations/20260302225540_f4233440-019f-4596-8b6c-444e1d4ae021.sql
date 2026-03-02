
-- Table for SoundCloud mixes managed via admin panel
CREATE TABLE public.soundcloud_mixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  soundcloud_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.soundcloud_mixes ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view mixes"
  ON public.soundcloud_mixes FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert mixes"
  ON public.soundcloud_mixes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mixes"
  ON public.soundcloud_mixes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mixes"
  ON public.soundcloud_mixes FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update timestamp
CREATE TRIGGER update_soundcloud_mixes_updated_at
  BEFORE UPDATE ON public.soundcloud_mixes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
