
-- Create equipment table
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_sv TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  description_sv TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_es TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Disc3',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view equipment"
  ON public.equipment FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert equipment"
  ON public.equipment FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update equipment"
  ON public.equipment FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete equipment"
  ON public.equipment FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default equipment data
INSERT INTO public.equipment (title_sv, title_en, title_es, description_sv, description_en, description_es, icon, sort_order) VALUES
('Pioneer CDJ-3000', 'Pioneer CDJ-3000', 'Pioneer CDJ-3000', 'Professionella CD/USB-spelare med 9" touch-skärm', 'Professional CD/USB players with 9" touch screen', 'Reproductores CD/USB profesionales con pantalla táctil de 9"', 'Disc3', 0),
('Pioneer DJM-900NXS2', 'Pioneer DJM-900NXS2', 'Pioneer DJM-900NXS2', '4-kanals professionell DJ-mixer', '4-channel professional DJ mixer', 'Mezclador DJ profesional de 4 canales', 'Music2', 1),
('Sennheiser HD 25', 'Sennheiser HD 25', 'Sennheiser HD 25', 'Branschstandard DJ-hörlurar', 'Industry standard DJ headphones', 'Auriculares DJ estándar de la industria', 'Headphones', 2),
('JBL EON ONE', 'JBL EON ONE', 'JBL EON ONE', 'Portabla PA-högtalare för mindre evenemang', 'Portable PA speakers for smaller events', 'Altavoces PA portátiles para eventos pequeños', 'Speaker', 3),
('QSC K12.2', 'QSC K12.2', 'QSC K12.2', 'Kraftfulla aktiva högtalare för större evenemang', 'Powerful active speakers for larger events', 'Altavoces activos potentes para eventos grandes', 'MonitorSpeaker', 4),
('Shure SM58', 'Shure SM58', 'Shure SM58', 'Professionell dynamisk mikrofon', 'Professional dynamic microphone', 'Micrófono dinámico profesional', 'Mic2', 5),
('Streaming Setup', 'Streaming Setup', 'Configuración de Streaming', 'Komplett utrustning för live streaming', 'Complete equipment for live streaming', 'Equipamiento completo para streaming en vivo', 'Radio', 6),
('Ljusshow', 'Light Show', 'Show de Luces', 'LED-belysning och lasrar för atmosfär', 'LED lighting and lasers for atmosphere', 'Iluminación LED y láseres para ambiente', 'Podcast', 7);
