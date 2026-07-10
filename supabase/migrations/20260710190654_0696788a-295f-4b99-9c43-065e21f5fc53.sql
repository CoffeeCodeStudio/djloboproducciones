
-- 1. Radio URLs in site_branding
ALTER TABLE public.site_branding
  ADD COLUMN IF NOT EXISTS radio_stream_url TEXT DEFAULT 'https://stream.zeno.fm/gzzqvbuy0d7uv',
  ADD COLUMN IF NOT EXISTS radio_player_url TEXT DEFAULT 'https://zeno.fm/radio/dj-lobo-radio-o85p/';

-- 2. Pricing packages (per-package editable copy)
CREATE TABLE public.pricing_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  price TEXT NOT NULL,
  name_sv TEXT NOT NULL, name_en TEXT NOT NULL, name_es TEXT NOT NULL,
  guests_sv TEXT NOT NULL, guests_en TEXT NOT NULL, guests_es TEXT NOT NULL,
  hours_sv TEXT NOT NULL, hours_en TEXT NOT NULL, hours_es TEXT NOT NULL,
  sound_light_sv TEXT NOT NULL, sound_light_en TEXT NOT NULL, sound_light_es TEXT NOT NULL,
  addon_sv TEXT NOT NULL, addon_en TEXT NOT NULL, addon_es TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_packages TO authenticated;
GRANT ALL ON public.pricing_packages TO service_role;
ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view pricing packages" ON public.pricing_packages FOR SELECT USING (true);
CREATE POLICY "Admins can insert pricing packages" ON public.pricing_packages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pricing packages" ON public.pricing_packages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pricing packages" ON public.pricing_packages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_pricing_packages_updated_at BEFORE UPDATE ON public.pricing_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Pricing shared settings (singleton row)
CREATE TABLE public.pricing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  large_event_sv TEXT NOT NULL, large_event_en TEXT NOT NULL, large_event_es TEXT NOT NULL,
  info_sv TEXT NOT NULL, info_en TEXT NOT NULL, info_es TEXT NOT NULL,
  cta_text_sv TEXT NOT NULL, cta_text_en TEXT NOT NULL, cta_text_es TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_settings TO authenticated;
GRANT ALL ON public.pricing_settings TO service_role;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view pricing settings" ON public.pricing_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert pricing settings" ON public.pricing_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pricing settings" ON public.pricing_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete pricing settings" ON public.pricing_settings FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_pricing_settings_updated_at BEFORE UPDATE ON public.pricing_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed pricing_packages with current hardcoded values
INSERT INTO public.pricing_packages (key, sort_order, price, name_sv, name_en, name_es, guests_sv, guests_en, guests_es, hours_sv, hours_en, hours_es, sound_light_sv, sound_light_en, sound_light_es, addon_sv, addon_en, addon_es) VALUES
('basic', 1, '7 000', 'BASIC', 'BASIC', 'BÁSICO', 'Upp till 60 personer', 'Up to 60 guests', 'Hasta 60 personas', '4 timmar spelning', '4 hours of performance', '4 horas de actuación', 'Ljud & ljus ingår', 'Sound & lights included', 'Sonido e iluminación incluidos', 'Tillägg: 1 000 kr/timme utöver 4h', 'Extra: 1 000 SEK/hour beyond 4h', 'Extra: 1 000 SEK/hora más allá de 4h'),
('standard', 2, '8 500', 'STANDARD', 'STANDARD', 'ESTÁNDAR', 'Upp till 80 personer', 'Up to 80 guests', 'Hasta 80 personas', '4 timmar spelning', '4 hours of performance', '4 horas de actuación', 'Ljud & ljus ingår', 'Sound & lights included', 'Sonido e iluminación incluidos', 'Tillägg: 1 000 kr/timme utöver 4h', 'Extra: 1 000 SEK/hour beyond 4h', 'Extra: 1 000 SEK/hora más allá de 4h'),
('premium', 3, '12 500', 'PREMIUM', 'PREMIUM', 'PREMIUM', '100–150 personer', '100–150 guests', '100–150 personas', '4 timmar spelning', '4 hours of performance', '4 horas de actuación', 'Ljud & ljus ingår', 'Sound & lights included', 'Sonido e iluminación incluidos', 'Tillägg: 1 000 kr/timme utöver 4h', 'Extra: 1 000 SEK/hour beyond 4h', 'Extra: 1 000 SEK/hora más allá de 4h');

INSERT INTO public.pricing_settings (large_event_sv, large_event_en, large_event_es, info_sv, info_en, info_es, cta_text_sv, cta_text_en, cta_text_es) VALUES
('150+ personer — Kontakta oss för offert', '150+ guests — Contact us for a quote', '150+ personas — Contáctenos para una cotización',
 'Transport tillkommer vid längre avstånd · Bokning minst 2 veckor i förväg · Vi spelar även utanför Göteborg', 'Transport costs apply for longer distances · Book at least 2 weeks in advance · We also play outside Gothenburg', 'Transporte adicional para largas distancias · Reserva con al menos 2 semanas de antelación · También tocamos fuera de Gotemburgo',
 'Vi har alltid en lösning — tveka inte att kontakta oss', 'We always find a solution — don''t hesitate to contact us', 'Siempre encontramos una solución — no dudes en contactarnos');

-- 4. Drop equipment table
DROP TABLE IF EXISTS public.equipment CASCADE;
