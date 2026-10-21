-- =====================================================================
-- SOKO patch 2 — Admin portal
-- Run ONCE in: Supabase Dashboard > SQL Editor > New query > paste > Run.
-- Safe to run again (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Requires patch 1 / the base schema to have been run already.
-- =====================================================================

-- ---------- 1. Hide-from-shop flag (products with orders can't be deleted) ----------
alter table public.products
  add column if not exists is_active boolean not null default true;

-- ---------- 2. is_admin() helper ----------
-- SECURITY DEFINER so policies can ask "is this user an admin?" without
-- recursing into the profiles table's own row-level security.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------- 3. Products: shoppers see active items, admins see and edit all ----------
drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "admins insert products" on public.products;
create policy "admins insert products" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update products" on public.products;
create policy "admins update products" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete products" on public.products;
create policy "admins delete products" on public.products
  for delete to authenticated using (public.is_admin());

-- ---------- 4. Categories ----------
drop policy if exists "admins insert categories" on public.categories;
create policy "admins insert categories" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update categories" on public.categories;
create policy "admins update categories" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete categories" on public.categories;
create policy "admins delete categories" on public.categories
  for delete to authenticated using (public.is_admin());

-- ---------- 5. Orders: admins can read everything and change status ----------
drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read order items" on public.order_items;
create policy "admins read order items" on public.order_items
  for select to authenticated using (public.is_admin());

-- ---------- 6. Profiles ----------
-- Regular users still can't make themselves admin: the new row's is_admin
-- must equal whatever is already stored. Admins can edit any profile.
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = public.is_admin());

drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- 7. Product image storage ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images are public" on storage.objects;
create policy "product images are public" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------- 8. place_order(): refuse hidden products ----------
create or replace function public.place_order(
  p_items jsonb,
  p_delivery jsonb,
  p_payment text
)
returns bigint
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_order_id bigint;
  v_subtotal integer := 0;
  v_fee constant integer := 300;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
begin
  if v_user is null then
    raise exception 'You must be logged in to place an order';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  insert into public.orders
    (user_id, payment_method, full_name, phone, county, town, address,
     subtotal, delivery_fee, total)
  values
    (v_user, p_payment,
     p_delivery ->> 'full_name', p_delivery ->> 'phone',
     p_delivery ->> 'county', p_delivery ->> 'town', p_delivery ->> 'address',
     0, v_fee, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    -- lock the row so two buyers can't take the last unit at once
    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::bigint
    for update;

    if not found then
      raise exception 'Product % not found', v_item ->> 'product_id';
    end if;
    if not v_product.is_active then
      raise exception '% is no longer available', v_product.name;
    end if;
    if v_product.stock < v_qty then
      raise exception 'Not enough stock for %', v_product.name;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;

    insert into public.order_items (order_id, product_id, name, price, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty);

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  update public.orders
  set subtotal = v_subtotal, total = v_subtotal + v_fee
  where id = v_order_id;

  return v_order_id;
end;
$$;

-- ---------- 9. MAKE YOURSELF THE FIRST ADMIN ----------
-- Replace the email with the one you registered with, then run this line:
--
--   update public.profiles
--   set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
