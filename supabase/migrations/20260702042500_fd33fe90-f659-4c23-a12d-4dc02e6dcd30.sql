
-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  logia text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- AUCTION ITEMS
CREATE TABLE public.auction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  starting_price numeric(12,2) NOT NULL,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.auction_items TO anon, authenticated;
GRANT ALL ON public.auction_items TO service_role;
ALTER TABLE public.auction_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read items" ON public.auction_items FOR SELECT TO anon, authenticated USING (true);

-- BIDS
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bidder_name text NOT NULL,
  bidder_logia text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bids_item_amount_idx ON public.bids(item_id, amount DESC);
GRANT SELECT ON public.bids TO anon, authenticated;
GRANT INSERT ON public.bids TO authenticated;
GRANT ALL ON public.bids TO service_role;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read bids" ON public.bids FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth insert own bid" ON public.bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger: enforce bid > current max and > starting price; deny after deadline
CREATE OR REPLACE FUNCTION public.validate_bid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  max_bid numeric;
  start_price numeric;
  deadline timestamptz := '2026-11-14 23:59:59-06'::timestamptz;
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
$$;
CREATE TRIGGER validate_bid_trg BEFORE INSERT ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.validate_bid();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, logia)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'logia', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_items;

-- Seed items
INSERT INTO public.auction_items (title, description, starting_price, sort_order) VALUES
('Mandil Masónico Bordado a Mano', 'Mandil de grado maestro, cuero fino con bordados en hilo dorado. Pieza ceremonial de coleccionista.', 2500, 1),
('Escuadra y Compás de Plata', 'Joya simbólica en plata 925, acabado espejo. Pieza única donada para el Capítulo Daga de Obsidiana.', 3000, 2),
('Libro Antiguo: "Moral y Dogma" de Albert Pike', 'Primera edición en español, tapa dura, con anotaciones históricas. Ejemplar de biblioteca privada.', 1800, 3),
('Espada Ceremonial del Tuiler', 'Réplica ceremonial, hoja de acero y empuñadura ornamentada. Ideal para ritualística de logia.', 4500, 4),
('Joya de Venerable Maestro', 'Medallón en bronce dorado con cinta azul, símbolo de autoridad y sabiduría.', 2200, 5),
('Anillo Masónico Grado 33', 'Oro laminado con incrustación de ónix negro y águila bicéfala grabada.', 3500, 6),
('Cuadro "Los Tres Grandes Luminares"', 'Óleo original firmado, 60x80 cm. Escena simbólica del taller masónico.', 5000, 7),
('Set de Copas de Ágape', 'Seis copas de cristal grabadas con la escuadra, compás y estrella flamígera.', 1500, 8);
