-- Table contacts
create table if not exists maivi_contacts (
  id uuid default gen_random_uuid() primary key,
  prenom text,
  nom text,
  type text default 'photo', -- photo, perso
  tel text,
  email text,
  adresse text,
  note text,
  created_at timestamptz default now()
);

-- Lien événement → contact
alter table maivi_evenements add column if not exists contact_id uuid references maivi_contacts(id);

-- Realtime + RLS
alter publication supabase_realtime add table maivi_contacts;
alter table maivi_contacts enable row level security;
create policy "public maivi_contacts" on maivi_contacts for all using (true) with check (true);

select 'Contacts OK ✓' as status;
