-- Add 'match_pairs' to the allowed exercise types.

alter table public.exercises
  drop constraint if exists exercises_type_check;

alter table public.exercises
  add constraint exercises_type_check
  check (type in ('phonics','handwriting','sight_word','vocabulary','match_pairs'));
