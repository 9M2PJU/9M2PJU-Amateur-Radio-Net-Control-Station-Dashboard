-- Create Profiles table (public user data)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  callsign text unique,
  name text,
  handle text,
  location text,
  grid_locator text,
  is_super_admin boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, callsign, name)
  values (new.id, new.raw_user_meta_data->>'callsign', new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if exists to avoid duplication errors on restart
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create Nets table
create table if not exists public.nets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  name text not null,
  type text,
  frequency text,
  mode text,
  slug text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

alter table public.nets enable row level security;
create policy "Nets are viewable by everyone" on public.nets for select using (true);
create policy "Users can create nets" on public.nets for insert with check (auth.role() = 'authenticated');
create policy "Net owners can update" on public.nets for update using (auth.uid() = user_id);

-- Create Checkins table
create table if not exists public.checkins (
  id uuid default gen_random_uuid() primary key,
  net_id uuid references public.nets(id) on delete cascade,
  callsign text not null,
  name text,
  location text,
  signal_report text,
  readability int,
  signal_strength int,
  remarks text,
  traffic boolean default false,
  traffic_precedence text,
  traffic_details text,
  grid_locator text,
  checked_in_at timestamptz default now()
);

alter table public.checkins enable row level security;
create policy "Checkins are viewable by everyone" on public.checkins for select using (true);
create policy "Auth users can checkin" on public.checkins for insert with check (auth.role() = 'authenticated');
create policy "Net owners can update checkins" on public.checkins for update using (
  auth.uid() in (select user_id from public.nets where id = net_id)
);
create policy "Net owners can delete checkins" on public.checkins for delete using (
  auth.uid() in (select user_id from public.nets where id = net_id)
);

-- Realtime publication
alter publication supabase_realtime add table public.nets, public.checkins;
