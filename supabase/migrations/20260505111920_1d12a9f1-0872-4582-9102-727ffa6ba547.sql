-- Recreate the public chat view with security_invoker=false so it can bypass
-- the new admin-only SELECT policy on chat_messages while still hiding session_id.
DROP VIEW IF EXISTS public.chat_messages_public;

CREATE VIEW public.chat_messages_public
WITH (security_invoker = false)
AS
SELECT id, nickname, message, created_at
FROM public.chat_messages;

GRANT SELECT ON public.chat_messages_public TO anon, authenticated;

COMMENT ON VIEW public.chat_messages_public IS
'Public view of chat messages that hides session_id. Runs with definer rights so anon/authenticated can read while direct chat_messages SELECT is admin-only.';