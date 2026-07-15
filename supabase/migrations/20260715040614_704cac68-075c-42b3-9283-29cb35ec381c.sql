CREATE OR REPLACE FUNCTION public.validate_bid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  max_bid numeric;
  start_price numeric;
  deadline timestamptz := '2026-08-31 23:59:59-06'::timestamptz;
BEGIN
  IF now() > deadline THEN
    RAISE EXCEPTION 'La subasta ya finalizó';
  END IF;
  SELECT starting_price INTO start_price FROM public.auction_items WHERE id = NEW.item_id;
  IF start_price IS NULL THEN
    RAISE EXCEPTION 'Objeto no encontrado';
  END IF;
  SELECT COALESCE(MAX(amount), 0) INTO max_bid FROM public.bids WHERE item_id = NEW.item_id;
  IF NEW.amount <= GREATEST(max_bid, start_price - 0.01) THEN
    RAISE EXCEPTION 'La puja debe ser mayor a la actual (L. %)', GREATEST(max_bid, start_price);
  END IF;
  RETURN NEW;
END;
$function$;