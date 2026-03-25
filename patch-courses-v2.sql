-- Listes de courses
create table if not exists maivi_listes (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  created_at timestamptz default now()
);

-- Colonnes supplémentaires sur maivi_courses
alter table maivi_courses add column if not exists liste_id uuid references maivi_listes(id);
alter table maivi_courses add column if not exists prix numeric(8,2);

-- Bibliothèque articles mémorisés
create table if not exists maivi_biblio (
  id uuid default gen_random_uuid() primary key,
  nom text not null,
  rayon text,
  prix numeric(8,2),
  code_barre text,
  nb_achats integer default 0,
  created_at timestamptz default now()
);

-- Realtime + RLS
alter publication supabase_realtime add table maivi_listes;
alter publication supabase_realtime add table maivi_biblio;
alter table maivi_listes enable row level security;
alter table maivi_biblio enable row level security;
create policy "public maivi_listes" on maivi_listes for all using (true) with check (true);
create policy "public maivi_biblio" on maivi_biblio for all using (true) with check (true);

select 'Courses v2 OK ✓' as status;
