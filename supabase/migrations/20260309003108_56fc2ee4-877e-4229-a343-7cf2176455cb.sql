-- Add radio_section_title to site_branding table
ALTER TABLE public.site_branding 
ADD COLUMN radio_section_title text DEFAULT 'Live Radio';