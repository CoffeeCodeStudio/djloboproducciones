ALTER TABLE public.mixcloud_mixes
  ADD COLUMN IF NOT EXISTS hidden_reason text
  CHECK (hidden_reason IN ('admin','auto_404'));

UPDATE public.mixcloud_mixes
  SET hidden_reason = 'admin'
  WHERE hidden = true AND hidden_reason IS NULL;