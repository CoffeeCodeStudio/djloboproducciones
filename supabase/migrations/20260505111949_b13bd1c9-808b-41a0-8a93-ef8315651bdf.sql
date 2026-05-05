-- Allow anon/authenticated to INSERT all relevant columns (RLS still enforces banning).
GRANT INSERT (nickname, message, session_id) ON public.chat_messages TO anon, authenticated;