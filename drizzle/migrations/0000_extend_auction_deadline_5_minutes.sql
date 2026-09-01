CREATE OR REPLACE FUNCTION public.validate_bid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  max_bid numeric;
  start_price numeric;
  deadline timestamptz := '2026-09-01 09:01:59-06'::timestamptz;
BEGIN
  IF now() > deadline THEN
    RAISE EXCEPTION 'La subasta ya finalizó';
  END IF;
  SELECT starting_price INTO start_price FROM public.auction_items WHERE id = NEW.item_id;
  IF start_price IS NULL THEN
    RAISE EXCEPTION 'Artículo no encontrado';
  END IF;
  SELECT COALESCE(MAX(amount), 0) INTO max_bid FROM public.bids WHERE item_id = NEW.item_id;
  IF max_bid = 0 THEN
    IF NEW.amount < start_price THEN
      RAISE EXCEPTION 'La puja debe ser al menos L%', start_price;
    END IF;
  ELSE
    IF NEW.amount <= max_bid THEN
      RAISE EXCEPTION 'La puja debe ser mayor a L%', max_bid;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;