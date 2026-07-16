
-- FIX 1: restrict bids SELECT to authenticated users
DROP POLICY IF EXISTS "public read bids" ON public.bids;
CREATE POLICY "authenticated read bids"
  ON public.bids FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.bids FROM anon;

-- FIX 2: move has_role out of exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Drop dependent policies (public + storage)
DROP POLICY IF EXISTS "admins delete items" ON public.auction_items;
DROP POLICY IF EXISTS "admins insert items" ON public.auction_items;
DROP POLICY IF EXISTS "admins update items" ON public.auction_items;
DROP POLICY IF EXISTS "admins upload auction images" ON storage.objects;
DROP POLICY IF EXISTS "admins update auction images" ON storage.objects;
DROP POLICY IF EXISTS "admins delete auction images" ON storage.objects;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Recreate auction_items admin policies
CREATE POLICY "admins delete items" ON public.auction_items FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins insert items" ON public.auction_items FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update items" ON public.auction_items FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Recreate storage policies for auction-images bucket
CREATE POLICY "admins upload auction images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'auction-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update auction images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'auction-images' AND private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'auction-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete auction images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'auction-images' AND private.has_role(auth.uid(), 'admin'::public.app_role));
