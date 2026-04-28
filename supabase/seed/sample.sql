-- Sample curriculum for development. Applied manually after `supabase db reset`:
--   psql postgresql://postgres:postgres@127.0.0.1:54422/postgres -f supabase/seed/sample.sql
-- Idempotent: uses fixed UUIDs and `on conflict do nothing`.

-- ─────────────────────────────── UNITS

insert into public.units (id, title, order_index, min_age) values
  ('00000000-0000-0000-0000-000000000102', 'First Words',     2, 4),
  ('00000000-0000-0000-0000-000000000103', 'Put It Together', 3, 5)
  on conflict (id) do nothing;

-- ─────────────────────────────── LESSONS

insert into public.lessons (id, unit_id, title, order_index) values
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000102', 'Animals',  1),
  ('00000000-0000-0000-0000-000000000207', '00000000-0000-0000-0000-000000000102', 'Colors',   2),
  ('00000000-0000-0000-0000-000000000208', '00000000-0000-0000-0000-000000000102', 'Numbers',  3),
  ('00000000-0000-0000-0000-000000000209', '00000000-0000-0000-0000-000000000103', 'Sight Words',    1),
  ('00000000-0000-0000-0000-000000000210', '00000000-0000-0000-0000-000000000103', 'Mini Sentences', 2)
  on conflict (id) do nothing;

-- ─────────────────────────────── EXERCISES
-- (lesson_id, type, prompt, expected jsonb, order_index)

-- Wipe & reinsert exercises for a clean dev seed
delete from public.exercises
where lesson_id in (
  '00000000-0000-0000-0000-000000000206','00000000-0000-0000-0000-000000000207',
  '00000000-0000-0000-0000-000000000208','00000000-0000-0000-0000-000000000209',
  '00000000-0000-0000-0000-000000000210'
);

insert into public.exercises (lesson_id, type, prompt, expected, order_index) values
  -- Lesson 6: Animals  (voice-only marked on Spell prompts)
  ('00000000-0000-0000-0000-000000000206','vocabulary', 'Moo! Which animal says moo?',                       '{"answer":"Cow","alternatives":["cow"]}',                                       1),
  ('00000000-0000-0000-0000-000000000206','vocabulary', 'Splash! It lives in water and has fins.',           '{"answer":"Fish","alternatives":["fish"]}',                                     2),
  ('00000000-0000-0000-0000-000000000206','vocabulary', 'Tweet! A tiny animal that flies.',                  '{"answer":"Bird","alternatives":["bird","birdy"]}',                             3),
  ('00000000-0000-0000-0000-000000000206','sight_word', 'Hop! Spell "frog".',                                '{"answer":"Frog","alternatives":["frog"],"voiceOnly":true}',                    4),

  -- Lesson 7: Colors
  ('00000000-0000-0000-0000-000000000207','vocabulary', 'The color of a strawberry.',                        '{"answer":"Red","alternatives":["red"]}',                                       1),
  ('00000000-0000-0000-0000-000000000207','vocabulary', 'The color of the sky on a sunny day.',              '{"answer":"Blue","alternatives":["blue"]}',                                     2),
  ('00000000-0000-0000-0000-000000000207','vocabulary', 'The color of grass.',                               '{"answer":"Green","alternatives":["green"]}',                                   3),
  ('00000000-0000-0000-0000-000000000207','vocabulary', 'The color of the sun.',                             '{"answer":"Yellow","alternatives":["yellow"]}',                                 4),

  -- Lesson 8: Numbers (Spell prompts → voice-only)
  ('00000000-0000-0000-0000-000000000208','sight_word', 'Spell the number 1.',                              '{"answer":"One","alternatives":["one","1"],"voiceOnly":true}',                   1),
  ('00000000-0000-0000-0000-000000000208','sight_word', 'Spell the number 2.',                              '{"answer":"Two","alternatives":["two","2"],"voiceOnly":true}',                   2),
  ('00000000-0000-0000-0000-000000000208','sight_word', 'Spell the number 3.',                              '{"answer":"Three","alternatives":["three","3"],"voiceOnly":true}',               3),
  ('00000000-0000-0000-0000-000000000208','vocabulary', 'How many paws does a cat have?',                    '{"answer":"Four","alternatives":["four","4"]}',                                  4),

  -- Lesson 9: Sight Words (all Spell → voice-only)
  ('00000000-0000-0000-0000-000000000209','sight_word', 'Spell "the".',                                     '{"answer":"the","alternatives":["The","THE"],"voiceOnly":true}',                  1),
  ('00000000-0000-0000-0000-000000000209','sight_word', 'Spell "is".',                                      '{"answer":"is","alternatives":["Is","IS"],"voiceOnly":true}',                     2),
  ('00000000-0000-0000-0000-000000000209','sight_word', 'Spell "and".',                                     '{"answer":"and","alternatives":["And","AND"],"voiceOnly":true}',                  3),
  ('00000000-0000-0000-0000-000000000209','sight_word', 'Spell "you".',                                     '{"answer":"you","alternatives":["You","YOU"],"voiceOnly":true}',                  4),

  -- Lesson 10: Mini Sentences
  ('00000000-0000-0000-0000-000000000210','vocabulary', 'Fill in: "The cat ___" (what does a cat say?)',     '{"answer":"meows","alternatives":["meow","Meows","Meow"]}',    1),
  ('00000000-0000-0000-0000-000000000210','vocabulary', 'Fill in: "I ___ you" (friendly feeling)',           '{"answer":"love","alternatives":["Love","LOVE"]}',             2),
  ('00000000-0000-0000-0000-000000000210','sight_word', 'Read it back: "The dog runs fast". Type the last word.', '{"answer":"fast","alternatives":["Fast","FAST"]}',       3);
