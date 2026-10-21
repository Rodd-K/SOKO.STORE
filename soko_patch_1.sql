-- =====================================================================
-- SOKO patch 1 — run this ONLY if you already ran the first soko_schema.sql.
-- Adds county/town to profiles and saves the phone number at signup.
-- =====================================================================

alter table public.profiles
  add column if not exists county text,
  add column if not exists town text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;
