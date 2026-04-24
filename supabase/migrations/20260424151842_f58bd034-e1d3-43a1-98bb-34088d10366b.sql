-- Add google_calendar_id to site_secrets (admin-only table)
ALTER TABLE public.site_secrets
  ADD COLUMN IF NOT EXISTS google_calendar_id text;

-- Copy existing value from site_branding to site_secrets
DO $$
DECLARE
  v_calendar_id text;
  v_secrets_count int;
BEGIN
  SELECT google_calendar_id INTO v_calendar_id
  FROM public.site_branding
  WHERE google_calendar_id IS NOT NULL
  LIMIT 1;

  IF v_calendar_id IS NOT NULL THEN
    SELECT count(*) INTO v_secrets_count FROM public.site_secrets;
    IF v_secrets_count = 0 THEN
      INSERT INTO public.site_secrets (google_calendar_id) VALUES (v_calendar_id);
    ELSE
      UPDATE public.site_secrets
      SET google_calendar_id = v_calendar_id, updated_at = now()
      WHERE id = (SELECT id FROM public.site_secrets LIMIT 1);
    END IF;
  END IF;
END $$;

-- Remove the publicly readable column from site_branding
ALTER TABLE public.site_branding
  DROP COLUMN IF EXISTS google_calendar_id;