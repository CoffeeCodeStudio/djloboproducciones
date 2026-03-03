
CREATE TABLE public.mixcloud_mixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  mixcloud_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mixcloud_mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mixcloud mixes" ON public.mixcloud_mixes FOR SELECT USING (true);
CREATE POLICY "Admins can insert mixcloud mixes" ON public.mixcloud_mixes FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update mixcloud mixes" ON public.mixcloud_mixes FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete mixcloud mixes" ON public.mixcloud_mixes FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_mixcloud_mixes_updated_at
BEFORE UPDATE ON public.mixcloud_mixes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
