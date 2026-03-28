SELECT cron.schedule(
  'cleanup-old-chat-messages',
  '0 4 * * *',
  $$DELETE FROM public.chat_messages WHERE created_at < now() - interval ''90 days''$$
);