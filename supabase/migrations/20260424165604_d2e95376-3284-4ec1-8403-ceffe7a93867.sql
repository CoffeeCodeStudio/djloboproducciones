ALTER TABLE public.promos
ADD COLUMN IF NOT EXISTS pinned_to_top boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_promos_pinned_active
  ON public.promos (pinned_to_top, is_active)
  WHERE pinned_to_top = true AND is_active = true;