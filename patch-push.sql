-- Table abonnements push
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  endpoint text unique not null,
  subscription jsonb not null,
  user_id text,
  updated_at timestamptz default now()
);

-- RLS : tout le monde peut s'abonner (app family)
alter table push_subscriptions enable row level security;
create policy "push open" on push_subscriptions for all using (true) with check (true);

select 'Push subscriptions OK' as status;
