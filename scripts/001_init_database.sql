-- Create profiles table with role support
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'sender' check (role in ('sender', 'receiver')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- RLS policies for profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Create category_types table (global reference, not user-specific)
create table if not exists public.category_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  type_id uuid references public.category_types(id) on delete set null,
  color text default '#3b82f6',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.categories enable row level security;

-- RLS policies for categories
drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id);
drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

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

alter table public.transactions enable row level security;

-- RLS policies for transactions - users can see their own transactions
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions
  for insert
  with check (auth.uid() = sender_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions
  for update
  using (auth.uid() = sender_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions
  for delete
  using (auth.uid() = sender_id);

-- Create trigger for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'sender')
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
create or replace function public.get_user_stats(user_id uuid)
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
  from transactions
  where sender_id = user_id or receiver_id = user_id;
$$;

-- Notify PostgREST to reload schema cache (run manually if needed)
-- NOTIFY pgrst, 'reload schema';
