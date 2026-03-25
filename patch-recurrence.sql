-- Colonnes récurrence
alter table maivi_evenements add column if not exists recurrence text default 'none';
alter table maivi_evenements add column if not exists recurrence_end date;
select 'Colonnes récurrence OK ✓' as status;
