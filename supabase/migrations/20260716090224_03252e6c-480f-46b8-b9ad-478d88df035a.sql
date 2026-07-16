-- Add second image column
ALTER TABLE public.auction_items ADD COLUMN IF NOT EXISTS image_url_2 text;

-- Enable realtime for bids
ALTER TABLE public.bids REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END$$;