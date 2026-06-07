
-- 1. Restrict realtime publication for chat_messages to exclude session_id
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages (id, nickname, message, created_at);

-- 2. Harden promo_events INSERT policy: validate promo_id exists and event_type is in allowed set
DROP POLICY IF EXISTS "Anyone can log promo events" ON public.promo_events;
CREATE POLICY "Anyone can log promo events"
ON public.promo_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('shown','closed','cta_click','permanent_dismiss','mini_shown','mini_dismissed','reopen_click')
  AND EXISTS (SELECT 1 FROM public.promos p WHERE p.id = promo_events.promo_id)
);
