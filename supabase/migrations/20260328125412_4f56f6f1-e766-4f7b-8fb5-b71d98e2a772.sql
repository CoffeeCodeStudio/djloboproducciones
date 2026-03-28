-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Cron job: delete contact_submissions older than 1 hour, every 15 minutes
SELECT cron.schedule(
  'cleanup-contact-submissions',
  '*/15 * * * *',
  $$DELETE FROM public.contact_submissions WHERE created_at < now() - interval '1 hour'$$
);

-- Cron job: delete bookings older than 24 months, once per month (1st at 03:00)
SELECT cron.schedule(
  'cleanup-old-bookings',
  '0 3 1 * *',
  $$DELETE FROM public.bookings WHERE created_at < now() - interval '24 months'$$
);