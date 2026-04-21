-- Create promos table
CREATE TABLE public.promos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  flyer_image_url text,
  youtube_url text,
  cta_text text,
  cta_url text,
  source text NOT NULL CHECK (source IN ('calendar', 'manual')),
  google_event_id text,
  active_from timestamptz NOT NULL,
  active_to timestamptz NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_promos_active_dates ON public.promos (is_active, active_from, active_to);
CREATE INDEX idx_promos_priority ON public.promos (priority DESC, created_at DESC);

-- Enable RLS
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read active promos"
  ON public.promos
  FOR SELECT
  USING (is_active = true AND now() BETWEEN active_from AND active_to);

CREATE POLICY "Admins can read all"
  ON public.promos
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert"
  ON public.promos
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update"
  ON public.promos
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete"
  ON public.promos
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_promos_updated_at
  BEFORE UPDATE ON public.promos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();