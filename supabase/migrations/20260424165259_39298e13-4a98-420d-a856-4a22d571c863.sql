ALTER TABLE public.site_branding
ADD COLUMN IF NOT EXISTS promo_sort_strategy text NOT NULL DEFAULT 'nearest_start';

-- Validate allowed values via trigger (CHECK constraints can be too rigid for future enum changes)
CREATE OR REPLACE FUNCTION public.validate_promo_sort_strategy()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.promo_sort_strategy NOT IN ('priority', 'nearest_end', 'nearest_start', 'rotation') THEN
    RAISE EXCEPTION 'Invalid promo_sort_strategy: %', NEW.promo_sort_strategy;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_promo_sort_strategy_trigger ON public.site_branding;
CREATE TRIGGER validate_promo_sort_strategy_trigger
BEFORE INSERT OR UPDATE OF promo_sort_strategy ON public.site_branding
FOR EACH ROW
EXECUTE FUNCTION public.validate_promo_sort_strategy();