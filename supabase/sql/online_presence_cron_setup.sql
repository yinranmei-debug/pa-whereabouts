-- Run once in the Supabase SQL editor AFTER the migration table exists
-- and AFTER (or after) deploying record-online-presence.
--
-- Replace YOUR_SERVICE_ROLE_KEY with:
--   Project Settings → API → service_role (secret)
-- Do not commit the real key.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select vault.create_secret(
  'https://vzdrpydtxlamoqtukgld.supabase.co',
  'whereabouts_project_url'
);

select vault.create_secret(
  'YOUR_SERVICE_ROLE_KEY',
  'whereabouts_service_role_key'
);

select cron.unschedule(jobid)
from cron.job
where jobname = 'record-online-presence';

select
  cron.schedule(
    'record-online-presence',
    '*/5 * * * *',
    $$
    select
      net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'whereabouts_project_url')
               || '/functions/v1/record-online-presence',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'whereabouts_service_role_key'),
          'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'whereabouts_service_role_key')
        ),
        body := jsonb_build_object('source', 'pg_cron')
      ) as request_id;
    $$
  );

-- Admin queries (SQL editor / service role only):
--
-- This week's online people (HKT week):
--   select * from online_presence_weekly
--   where week_start_hk = date_trunc('week', now() at time zone 'Asia/Hong_Kong')::date
--   order by samples desc;
--
-- Today (HKT):
--   select email, name, count(*) as samples,
--          min(recorded_at) as first_seen, max(recorded_at) as last_seen
--   from online_presence_log
--   where (recorded_at at time zone 'Asia/Hong_Kong')::date
--       = (now() at time zone 'Asia/Hong_Kong')::date
--   group by 1,2
--   order by samples desc;
