-- Revoke column-level SELECT on session_id from public roles
REVOKE SELECT (session_id) ON public.chat_messages FROM anon;
REVOKE SELECT (session_id) ON public.chat_messages FROM authenticated;
REVOKE SELECT (session_id) ON public.chat_messages FROM PUBLIC;

-- Re-grant SELECT on the safe columns to keep the public chat readable
GRANT SELECT (id, nickname, message, created_at) ON public.chat_messages TO anon;
GRANT SELECT (id, nickname, message, created_at) ON public.chat_messages TO authenticated;

-- service_role retains full access for edge functions / admin tools
GRANT ALL ON public.chat_messages TO service_role;