-- Admin-only online presence samples (no frontend access).
-- Retention: rolling 7 days. Edge function record-online-presence writes rows.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table if not exists public.online_presence_log (
  id bigint generated always as identity primary key,
  sample_id uuid not null,
  recorded_at timestamptz not null default now(),
  staff_id text,
  email text not null,
  name text
);

comment on table public.online_presence_log is
  'Backend-only snapshots of who had the board open. Kept for 7 days. No frontend policies.';

create index if not exists online_presence_log_recorded_at_idx
  on public.online_presence_log (recorded_at desc);

create index if not exists online_presence_log_email_recorded_at_idx
  on public.online_presence_log (email, recorded_at desc);

create index if not exists online_presence_log_sample_id_idx
  on public.online_presence_log (sample_id);

alter table public.online_presence_log enable row level security;

-- Publishable / logged-in app clients must not read or write this table.
revoke all on table public.online_presence_log from anon, authenticated, public;
grant select, insert, delete on table public.online_presence_log to service_role;
grant usage, select on sequence public.online_presence_log_id_seq to service_role;

-- Weekly rollup for admins in the SQL editor (service role / dashboard).
create or replace view public.online_presence_weekly
with (security_invoker = true)
as
select
  (date_trunc('week', recorded_at at time zone 'Asia/Hong_Kong'))::date as week_start_hk,
  staff_id,
  email,
  name,
  count(*)::int as samples,
  count(distinct sample_id)::int as distinct_samples,
  min(recorded_at) as first_seen,
  max(recorded_at) as last_seen
from public.online_presence_log
group by 1, 2, 3, 4;

revoke all on public.online_presence_weekly from anon, authenticated, public;
grant select on public.online_presence_weekly to service_role;

-- Purge helper (also called from the edge function each run).
create or replace function public.cleanup_online_presence_log()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted integer;
begin
  delete from public.online_presence_log
  where recorded_at < now() - interval '7 days';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke all on function public.cleanup_online_presence_log() from public, anon, authenticated;
grant execute on function public.cleanup_online_presence_log() to service_role;

-- Optional daily safety net if the edge function is down.
select cron.unschedule(jobid)
from cron.job
where jobname = 'cleanup-online-presence-log';

select cron.schedule(
  'cleanup-online-presence-log',
  '15 16 * * *', -- 00:15 HKT
  $$select public.cleanup_online_presence_log();$$
);
