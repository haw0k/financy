-- Drop tables in reverse dependency order (for idempotent re-run)
drop table if exists public.transactions;
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

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  amount decimal(12, 2) not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  description text,
  date date not null default current_date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.transactions disable row level security;

-- Create trigger for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'sender'),
    case
      when new.raw_user_meta_data ->> 'role' = 'admin' then 'approved'
      else 'pending'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

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
      when type = 'income' then amount
      else -amount
    end), 0) as total_balance,
    coalesce(sum(case when type = 'income' then amount else 0 end), 0) as total_income,
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0) as total_expense
  from transactions;
$$;

-- Notify PostgREST to reload schema cache (run manually if needed)
-- NOTIFY pgrst, 'reload schema';
