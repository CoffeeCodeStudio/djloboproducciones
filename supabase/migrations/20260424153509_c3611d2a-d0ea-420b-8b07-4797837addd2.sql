-- Track promo interactions for conversion analytics
CREATE TABLE public.promo_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_id uuid NOT NULL,
  event_type text NOT NULL,
  session_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast per-promo aggregation
CREATE INDEX idx_promo_events_promo_id_created_at
  ON public.promo_events (promo_id, created_at DESC);

CREATE INDEX idx_promo_events_event_type
  ON public.promo_events (event_type);

-- Restrict event types to a known vocabulary via validation trigger
-- (using a trigger instead of a CHECK constraint per project guidelines)
CREATE OR REPLACE FUNCTION public.validate_promo_event_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.event_type NOT IN (
    'shown', 'closed', 'cta_click', 'permanent_dismiss',
    'mini_shown', 'mini_dismissed', 'reopen_click'
  ) THEN
    RAISE EXCEPTION 'Invalid promo event_type: %', NEW.event_type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_promo_event_type
  BEFORE INSERT OR UPDATE ON public.promo_events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_promo_event_type();

ALTER TABLE public.promo_events ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can log an event
CREATE POLICY "Anyone can log promo events"
  ON public.promo_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read aggregated events
CREATE POLICY "Admins can view promo events"
  ON public.promo_events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can clean up old events
CREATE POLICY "Admins can delete promo events"
  ON public.promo_events
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));