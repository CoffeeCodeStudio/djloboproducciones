
-- FIX 1: chat_messages — drop permissive public SELECT, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read messages" ON public.chat_messages;

CREATE POLICY "Authenticated can read messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (true);

-- Ensure the public-safe view is readable by anon/authenticated
GRANT SELECT ON public.chat_messages_public TO anon, authenticated;

-- FIX 2: Add DB-level size caps on user-submitted text columns
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_name_length_chk     CHECK (name IS NULL OR char_length(name) <= 200),
  ADD CONSTRAINT bookings_email_length_chk    CHECK (email IS NULL OR char_length(email) <= 254),
  ADD CONSTRAINT bookings_phone_length_chk    CHECK (phone IS NULL OR char_length(phone) <= 30),
  ADD CONSTRAINT bookings_location_length_chk CHECK (location IS NULL OR char_length(location) <= 300),
  ADD CONSTRAINT bookings_message_length_chk  CHECK (message IS NULL OR char_length(message) <= 5000);

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_email_length_chk CHECK (email IS NULL OR char_length(email) <= 254);

-- contact_submissions currently has no name/message columns; add the constraints conditionally
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='name') THEN
    EXECUTE 'ALTER TABLE public.contact_submissions ADD CONSTRAINT contact_submissions_name_length_chk CHECK (name IS NULL OR char_length(name) <= 200)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contact_submissions' AND column_name='message') THEN
    EXECUTE 'ALTER TABLE public.contact_submissions ADD CONSTRAINT contact_submissions_message_length_chk CHECK (message IS NULL OR char_length(message) <= 5000)';
  END IF;
END $$;
