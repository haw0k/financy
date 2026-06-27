-- Drop tables in reverse dependency order (for idempotent re-run)
drop table if exists public.transactions;
drop table if exists public.currencies;
drop table if exists public.categories;
drop table if exists public.category_types;
drop table if exists public.profiles cascade;

-- Create profiles table with role support
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'sender' check (role in ('sender', 'receiver', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles disable row level security;

-- Enforce single approved admin at the database level (closes TOCTOU race in adminSignUpAction)
create unique index if not exists idx_profiles_single_approved_admin
  on public.profiles (role)
  where role = 'admin' and status = 'approved';

-- Create category_types table (global reference, not user-specific)
create table if not exists public.category_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

alter table public.category_types disable row level security;

-- Create categories table (global reference, not user-specific)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  type_id uuid references public.category_types(id) on delete set null,
  color text default '#3b82f6',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.categories disable row level security;

-- Create currencies table
create table if not exists public.currencies (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  symbol text not null,
  created_at timestamp with time zone default now()
);

alter table public.currencies disable row level security;

-- Seed supported currencies
insert into public.currencies (code, name, symbol)
values
  ('UAH', 'Ukrainian hryvnia', '₴'),
  ('USD', 'US dollar', '$'),
  ('EUR', 'Euro', '€')
on conflict (code) do nothing;

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  amount decimal(12, 2) not null check (amount > 0),
  currency_id uuid not null references public.currencies(id) on delete restrict,
  exchange_rate decimal(18, 6) not null check (exchange_rate > 0),
  amount_usd decimal(12, 2) not null check (amount_usd > 0),
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  description text,
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.transactions disable row level security;

-- Create trigger for auto-creating profile on signup
-- SECURITY: Uses 'security definer' with explicit search_path to prevent privilege escalation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_role text;
  user_status text;
begin
  user_role := coalesce(new.raw_user_meta_data ->> 'role', 'sender');
  user_status := 'pending';

  insert into public.profiles (id, email, role, status)
  values (
    new.id,
    new.email,
    user_role,
    user_status
  )
  on conflict (id) do nothing;

  -- Update app_metadata to include role and status for JWT claims
  -- Safe: auth.users has no user-defined triggers that could cause recursion
  begin
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
      'role', user_role,
      'status', user_status
    )
    where id = new.id;
  exception when others then
    raise warning 'Failed to update app_metadata for user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create trigger for updating app_metadata when profile role/status changes
-- SECURITY: Uses 'security definer' with explicit search_path to prevent privilege escalation
create or replace function public.handle_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Update app_metadata only if role or status changed
  if new.role is distinct from old.role or new.status is distinct from old.status then
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
      'role', new.role,
      'status', new.status
    )
    where id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;

create trigger on_profile_updated
  after update of role, status on public.profiles
  for each row
  execute function public.handle_profile_update();

-- Create trigger for auto-approving admin on email confirmation
-- When an admin confirms their email, the profile status transitions from 'pending' to 'approved'.
-- The unique partial index idx_profiles_single_approved_admin ensures only one admin can be approved.
-- SECURITY: Uses 'security definer' with explicit search_path to prevent privilege escalation
create or replace function public.handle_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.profiles
    set status = 'approved', updated_at = now()
    where id = new.id and role = 'admin' and status = 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;

create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  execute function public.handle_email_confirmation();

-- Create function to get user statistics
create or replace function public.get_user_stats()
returns table (
  total_balance decimal,
  total_income decimal,
  total_expense decimal
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(sum(case
      when type = 'income' then amount_usd
      else -amount_usd
    end), 0) as total_balance,
    coalesce(sum(case when type = 'income' then amount_usd else 0 end), 0) as total_income,
    coalesce(sum(case when type = 'expense' then amount_usd else 0 end), 0) as total_expense
  from transactions;
$$;

-- Backfill profiles for existing auth users who don't have one yet
insert into public.profiles (id, email, role, status)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'role', 'sender'),
  'pending'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;

-- Approve exactly one admin if no approved admin exists yet.
-- The unique partial index idx_profiles_single_approved_admin guarantees only one.
update public.profiles
set status = 'approved', updated_at = now()
where id = (
  select id
  from public.profiles
  where role = 'admin' and status = 'pending'
  order by created_at, id
  limit 1
)
and not exists (
  select 1 from public.profiles where role = 'admin' and status = 'approved'
);

-- Backfill app_metadata for existing users (populate role/status in JWT)
-- Uses COALESCE to handle NULL raw_app_meta_data (NULL || jsonb = NULL in PostgreSQL)
update auth.users au
set raw_app_meta_data = coalesce(au.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', coalesce(p.role, 'sender'),
  'status', coalesce(p.status, 'pending')
)
from public.profiles p
where p.id = au.id
and (au.raw_app_meta_data ->> 'role' is null or au.raw_app_meta_data ->> 'status' is null);

-- Notify PostgREST to reload schema cache (run manually if needed)
-- NOTIFY pgrst, 'reload schema';
