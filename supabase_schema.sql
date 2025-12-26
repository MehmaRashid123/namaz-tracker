-- Users table is handled by Supabase Auth, we just need a profile table
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  date_of_birth date,
  gender text check (gender in ('male', 'female')),
  puberty_age int,
  period_duration int,
  safe_mode boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- 2. QAZA LOGS TABLE (Stores the total count pending AND performed)
create table public.qaza_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  -- Remaining Counts
  fajr int default 0,
  dhuhr int default 0,
  asr int default 0,
  maghrib int default 0,
  isha int default 0,
  witr int default 0,
  -- Performed Counts (New)
  perf_fajr int default 0,
  perf_dhuhr int default 0,
  perf_asr int default 0,
  perf_maghrib int default 0,
  perf_isha int default 0,
  perf_witr int default 0,
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

alter table public.qaza_logs enable row level security;

create policy "Users can view their own qaza logs" on qaza_logs
  for select using (auth.uid() = user_id);

create policy "Users can update their own qaza logs" on qaza_logs
  for update using (auth.uid() = user_id);

create policy "Users can insert their own qaza logs" on qaza_logs
  for insert with check (auth.uid() = user_id);

-- 3. DAILY LOGS TABLE (Tracks daily performance)
create table public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  fajr boolean default false,
  dhuhr boolean default false,
  asr boolean default false,
  maghrib boolean default false,
  isha boolean default false,
  witr boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

alter table public.daily_logs enable row level security;

create policy "Users can view their own daily logs" on daily_logs
  for select using (auth.uid() = user_id);

create policy "Users can update their own daily logs" on daily_logs
  for update using (auth.uid() = user_id);

create policy "Users can insert their own daily logs" on daily_logs
  for insert with check (auth.uid() = user_id);
