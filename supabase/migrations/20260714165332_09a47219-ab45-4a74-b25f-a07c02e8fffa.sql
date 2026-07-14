
-- 1. Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. has_role security-definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Admin RLS on auction_items (SELECT public policy already exists)
CREATE POLICY "admins insert items" ON public.auction_items
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update items" ON public.auction_items
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete items" ON public.auction_items
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Storage policies for auction-images bucket
CREATE POLICY "public read auction images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'auction-images');

CREATE POLICY "admins upload auction images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'auction-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update auction images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'auction-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete auction images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'auction-images' AND public.has_role(auth.uid(), 'admin'));

-- 5. Grant admin role to the designated user (idempotent, only if user exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'mauricio.shn@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
