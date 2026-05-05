-- 1. Lock down direct chat_messages reads (public continues to read via chat_messages_public view)
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;

CREATE POLICY "Admins can read messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure the public view remains readable
GRANT SELECT ON public.chat_messages_public TO anon, authenticated;

-- 2. Defense-in-depth restrictive policy: only admins may insert into user_roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Realtime authorization policies on realtime.messages
-- Allow authenticated users to subscribe to the public chat room only.
DROP POLICY IF EXISTS "Authenticated can read chat-room broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated can read chat-room broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'chat-room'
  OR (
    realtime.topic() LIKE 'admin:%'
    AND has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Authenticated can broadcast to chat-room" ON realtime.messages;
CREATE POLICY "Authenticated can broadcast to chat-room"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = 'chat-room'
  OR (
    realtime.topic() LIKE 'admin:%'
    AND has_role(auth.uid(), 'admin'::app_role)
  )
);