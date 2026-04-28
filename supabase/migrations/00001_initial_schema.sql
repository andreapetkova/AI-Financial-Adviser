-- Initial database schema for AI Financial Assistant

-- profiles table (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- uploads table (tracks CSV upload batches)
create table uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  filename text not null,
  row_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- transactions table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  category text,
  confidence numeric(3, 2),
  manually_edited boolean not null default false,
  upload_batch_id uuid not null references uploads(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- budgets table
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  limit_amount numeric(12, 2) not null,
  month text not null, -- format: YYYY-MM
  created_at timestamptz not null default now(),
  unique (user_id, category, month)
);

-- insights table
create table insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  type text not null check (type in ('warning', 'saving', 'info')),
  generated_at timestamptz not null default now(),
  month text not null -- format: YYYY-MM
);

-- Indexes
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_date on transactions(date);
create index idx_transactions_upload_batch on transactions(upload_batch_id);
create index idx_budgets_user_month on budgets(user_id, month);
create index idx_insights_user_month on insights(user_id, month);
create index idx_uploads_user_id on uploads(user_id);

-- Row Level Security
alter table profiles enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table insights enable row level security;
alter table uploads enable row level security;

-- RLS policies: users can only access their own data

-- profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- transactions
create policy "Users can view own transactions"
  on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions"
  on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions"
  on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions"
  on transactions for delete using (auth.uid() = user_id);

-- budgets
create policy "Users can view own budgets"
  on budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets"
  on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets"
  on budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets"
  on budgets for delete using (auth.uid() = user_id);

-- insights
create policy "Users can view own insights"
  on insights for select using (auth.uid() = user_id);
create policy "Users can insert own insights"
  on insights for insert with check (auth.uid() = user_id);
create policy "Users can delete own insights"
  on insights for delete using (auth.uid() = user_id);

-- uploads
create policy "Users can view own uploads"
  on uploads for select using (auth.uid() = user_id);
create policy "Users can insert own uploads"
  on uploads for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
