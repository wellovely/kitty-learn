-- Parent notifications: in-app feed for achievement, streak risk, weekly summary.

set search_path = public, extensions;

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  child_id   uuid references public.children(id) on delete cascade,
  type       text not null check (type in ('achievement','streak_risk','weekly_summary')),
  title      text not null,
  body       text,
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at    timestamptz
);

create index notifications_parent_created_idx
  on public.notifications(parent_id, created_at desc);

create index notifications_parent_unread_idx
  on public.notifications(parent_id)
  where read_at is null;

-- Dedupe key for cron-generated notifications (one streak_risk per child per day, etc.).
create unique index notifications_dedupe_idx
  on public.notifications(parent_id, child_id, type, ((payload->>'dedupe_key')))
  where (payload ? 'dedupe_key');

alter table public.notifications enable row level security;

-- Parents read & update (mark-read) their own notifications. Inserts go through
-- the service role from server-side flows (submit-progress, cron jobs).
create policy notifications_owner_select on public.notifications
  for select to authenticated
  using (parent_id = auth.uid() or public.is_admin(auth.uid()));

create policy notifications_owner_update on public.notifications
  for update to authenticated
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());
