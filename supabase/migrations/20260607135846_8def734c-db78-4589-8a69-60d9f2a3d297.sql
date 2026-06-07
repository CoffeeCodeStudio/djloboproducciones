-- Tighten promo_events INSERT policy: validate session_id format/length so
-- anonymous clients cannot pollute analytics with arbitrary or oversized values.
DROP POLICY IF EXISTS "Anyone can log promo events" ON public.promo_events;

CREATE POLICY "Anyone can log promo events"
ON public.promo_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type = ANY (ARRAY['shown','closed','cta_click','permanent_dismiss','mini_shown','mini_dismissed','reopen_click'])
  AND EXISTS (SELECT 1 FROM public.promos p WHERE p.id = promo_events.promo_id)
  AND (
    session_id IS NULL
    OR (
      char_length(session_id) BETWEEN 8 AND 64
      AND session_id ~ '^[A-Za-z0-9_-]+$'
    )
  )
);