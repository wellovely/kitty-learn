-- Extend notification types and enable Supabase Realtime for parent in-app delivery.

set search_path = public, extensions;

alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'achievement',
    'streak_risk',
    'weekly_summary',
    'lesson_completed',
    'streak'
  ));

alter publication supabase_realtime add table public.notifications;
