alter table maivi_evenements add column if not exists lieu text;
select 'Colonne lieu OK ✓' as status;
