-- Kitty-Learn initial schema
-- Roles: parent, admin. Children are rows (no auth), owned by parents.

set search_path = public, extensions;

-- ───────────────────────────────────────────────────────── tables

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'parent' check (role in ('parent','admin')),
  full_name  text,
  created_at timestamptz not null default now()
);

create table public.children (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  age        int  not null check (age between 3 and 10),
  avatar_url text,
  created_at timestamptz not null default now()
);
create index children_parent_id_idx on public.children(parent_id);

create table public.units (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  order_index int  not null,
  min_age     int  not null default 3,
  created_at  timestamptz not null default now()
);

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  unit_id     uuid not null references public.units(id) on delete cascade,
  title       text not null,
  order_index int  not null,
  created_at  timestamptz not null default now()
);
create index lessons_unit_idx on public.lessons(unit_id);

create table public.exercises (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  type        text not null check (type in ('phonics','handwriting','sight_word','vocabulary')),
  prompt      text not null,
  expected    jsonb not null,
  assets      jsonb,
  order_index int  not null,
  created_at  timestamptz not null default now()
);
create index exercises_lesson_idx on public.exercises(lesson_id);

create table public.progress (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id)  on delete cascade,
  stars        int  not null default 0 check (stars between 0 and 3),
  xp_earned    int  not null default 0,
  completed_at timestamptz,
  attempts     int  not null default 0,
  unique (child_id, lesson_id)
);
create index progress_child_idx on public.progress(child_id);

create table public.child_stats (
  child_id        uuid primary key references public.children(id) on delete cascade,
  total_xp        int  not null default 0,
  level           int  not null default 1,
  hearts          int  not null default 5,
  streak_days     int  not null default 0,
  last_active_on  date,
  updated_at      timestamptz not null default now()
);

create table public.badges (
  id    uuid primary key default gen_random_uuid(),
  code  text unique not null,
  title text not null,
  icon  text not null
);

create table public.child_badges (
  child_id   uuid references public.children(id) on delete cascade,
  badge_id   uuid references public.badges(id)   on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (child_id, badge_id)
);

create table public.exercise_attempts (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children(id)  on delete cascade,
  exercise_id  uuid not null references public.exercises(id) on delete cascade,
  answer       text,
  is_correct   boolean not null,
  ai_feedback  text,
  created_at   timestamptz not null default now()
);
create index attempts_child_idx on public.exercise_attempts(child_id, created_at desc);

-- ───────────────────────────────────────────────────────── helpers

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

create or replace function public.owns_child(uid uuid, cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.children c where c.id = cid and c.parent_id = uid);
$$;

-- ───────────────────────────────────────────────────────── profile auto-create

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'parent', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────────────────────────────────────── RLS

alter table public.profiles          enable row level security;
alter table public.children          enable row level security;
alter table public.units             enable row level security;
alter table public.lessons           enable row level security;
alter table public.exercises         enable row level security;
alter table public.progress          enable row level security;
alter table public.child_stats       enable row level security;
alter table public.badges            enable row level security;
alter table public.child_badges      enable row level security;
alter table public.exercise_attempts enable row level security;

-- profiles: user reads own row; admin reads all
create policy profiles_self_select on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin(auth.uid()));
create policy profiles_self_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- children: parent sees/manages their own; admin sees all
create policy children_parent_rw on public.children
  for all to authenticated
  using (parent_id = auth.uid() or public.is_admin(auth.uid()))
  with check (parent_id = auth.uid() or public.is_admin(auth.uid()));

-- curriculum: read open to authenticated; write admin-only
create policy units_read     on public.units     for select to authenticated using (true);
create policy lessons_read   on public.lessons   for select to authenticated using (true);
create policy exercises_read on public.exercises for select to authenticated using (true);
create policy badges_read    on public.badges    for select to authenticated using (true);

create policy units_admin_write     on public.units
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy lessons_admin_write   on public.lessons
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy exercises_admin_write on public.exercises
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy badges_admin_write    on public.badges
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- progress/stats/badges/attempts: scoped via owns_child
create policy progress_rw on public.progress
  for all to authenticated
  using (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()))
  with check (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()));

create policy child_stats_rw on public.child_stats
  for all to authenticated
  using (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()))
  with check (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()));

create policy child_badges_rw on public.child_badges
  for all to authenticated
  using (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()))
  with check (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()));

create policy attempts_rw on public.exercise_attempts
  for all to authenticated
  using (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()))
  with check (public.owns_child(auth.uid(), child_id) or public.is_admin(auth.uid()));

-- ───────────────────────────────────────────────────────── seed badges

insert into public.badges (code, title, icon) values
  ('first_lesson',  'First Steps',      '🐾'),
  ('streak_3',      '3-Day Streak',     '🔥'),
  ('streak_7',      'Week Warrior',     '⚡'),
  ('perfect_stars', '3-Star Purr-fect', '⭐'),
  ('xp_100',        'XP Explorer',      '🎒'),
  ('xp_500',        'Word Wizard',      '🧙');
