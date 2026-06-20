-- Migration: Add role/status to JWT app_metadata
-- Run this script in Supabase SQL Editor to enable reading role/status from JWT tokens
-- Date: 2026-06-01

-- ============================================================================
-- 1. Update handle_new_user trigger to populate app_metadata
-- ============================================================================

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

-- ============================================================================
-- 2. Create trigger for updating app_metadata on profile changes
-- ============================================================================

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

-- ============================================================================
-- 3. Backfill app_metadata for existing users
-- ============================================================================

-- Uses COALESCE to handle NULL raw_app_meta_data (NULL || jsonb = NULL in PostgreSQL)
update auth.users au
set raw_app_meta_data = coalesce(au.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', coalesce(p.role, 'sender'),
  'status', coalesce(p.status, 'pending')
)
from public.profiles p
where p.id = au.id
and (
  au.raw_app_meta_data ->> 'role' is null
  or au.raw_app_meta_data ->> 'status' is null
);

-- ============================================================================
-- 4. Notify PostgREST to reload schema cache
-- ============================================================================

-- NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Check that all users have role/status in app_metadata:
-- select id, email, raw_app_meta_data ->> 'role' as role, raw_app_meta_data ->> 'status' as status
-- from auth.users
-- order by created_at desc;
