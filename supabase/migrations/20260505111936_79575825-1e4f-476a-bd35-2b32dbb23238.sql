-- Revert to invoker view
DROP VIEW IF EXISTS public.chat_messages_public;
CREATE VIEW public.chat_messages_public
WITH (security_invoker = true)
AS
SELECT id, nickname, message, created_at
FROM public.chat_messages;
GRANT SELECT ON public.chat_messages_public TO anon, authenticated;

-- Restore public SELECT on chat_messages (needed by the invoker view + admin tools)
DROP POLICY IF EXISTS "Admins can read messages" ON public.chat_messages;
CREATE POLICY "Anyone can read messages"
ON public.chat_messages
FOR SELECT
USING (true);

-- But hide session_id at the column-grant level from anon/authenticated.
REVOKE SELECT ON public.chat_messages FROM anon, authenticated;
GRANT SELECT (id, nickname, message, created_at)
  ON public.chat_messages TO anon, authenticated;