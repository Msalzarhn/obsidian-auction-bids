create table if not exists public.auction_item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.auction_items(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.auction_item_images to anon;
grant select on public.auction_item_images to authenticated;
grant all on public.auction_item_images to service_role;
alter table public.auction_item_images enable row level security;
create policy "public read item images" on public.auction_item_images for select to anon, authenticated using (true);
create policy "admins insert item images" on public.auction_item_images for insert to authenticated with check (private.has_role(auth.uid(),'admin'));
create policy "admins update item images" on public.auction_item_images for update to authenticated using (private.has_role(auth.uid(),'admin')) with check (private.has_role(auth.uid(),'admin'));
create policy "admins delete item images" on public.auction_item_images for delete to authenticated using (private.has_role(auth.uid(),'admin'));
create index if not exists auction_item_images_item_idx on public.auction_item_images(item_id, sort_order);