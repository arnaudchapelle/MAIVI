-- Ajouter colonne enseigne à maivi_listes
alter table maivi_listes add column if not exists enseigne text;

-- Mettre à jour la liste Leclerc par défaut si elle existe
update maivi_listes set enseigne='Leclerc' where nom='Leclerc' and enseigne is null;

select 'Enseigne OK ✓' as status;
