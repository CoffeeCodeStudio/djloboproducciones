
ALTER TABLE public.gallery_images 
  ADD COLUMN media_type TEXT NOT NULL DEFAULT 'photo',
  ADD COLUMN video_url TEXT NULL;
