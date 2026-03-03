
-- Add management columns to soundcloud_mixes
ALTER TABLE public.soundcloud_mixes 
  ADD COLUMN IF NOT EXISTS cover_art_url TEXT,
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

-- Add management columns to mixcloud_mixes
ALTER TABLE public.mixcloud_mixes 
  ADD COLUMN IF NOT EXISTS cover_art_url TEXT,
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

-- Index for deduplication on auto-fetch
CREATE INDEX IF NOT EXISTS idx_mixcloud_external_id ON public.mixcloud_mixes(external_id);
CREATE INDEX IF NOT EXISTS idx_soundcloud_external_id ON public.soundcloud_mixes(external_id);
