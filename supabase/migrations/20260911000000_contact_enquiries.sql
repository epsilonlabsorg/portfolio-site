-- Public visitors cannot read or write these tables, even with a publishable key.
create table public.contact_enquiries (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  company text not null default '' check (char_length(company) <= 150),
  service text not null default '' check (char_length(service) <= 100),
  message text not null check (char_length(btrim(message)) between 10 and 4000),
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed'))
);
create index contact_enquiries_created_at_idx on public.contact_enquiries (created_at desc);

create table public.contact_rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  primary key (bucket, window_start)
);

alter table public.contact_enquiries enable row level security;
alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_enquiries, public.contact_rate_limits from public, anon, authenticated;
grant all on public.contact_enquiries, public.contact_rate_limits to service_role;

-- One transaction serializes the global bucket, deduplicates retries, applies
-- limits, and persists the enquiry. No browser-executable RPC or RLS policies.
create function public.submit_contact_enquiry(
  p_id uuid, p_name text, p_email text, p_company text,
  p_service text, p_message text, p_email_hash text
) returns text
language plpgsql security invoker set search_path = ''
as $$
declare
  v_window timestamptz := date_trunc('hour', now());
  v_global integer;
  v_email integer;
begin
  if p_email_hash is null or p_email_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid rate-limit key';
  end if;

  insert into public.contact_rate_limits (bucket, window_start)
    values ('global', v_window) on conflict do nothing;
  select attempts into v_global from public.contact_rate_limits
    where bucket = 'global' and window_start = v_window for update;

  -- A retry after a network timeout does not save or count the enquiry twice.
  if exists (select 1 from public.contact_enquiries where id = p_id) then
    return 'stored';
  end if;
  if v_global >= 100 then return 'rate_limited'; end if;

  insert into public.contact_rate_limits (bucket, window_start)
    values (p_email_hash, v_window) on conflict do nothing;
  select attempts into v_email from public.contact_rate_limits
    where bucket = p_email_hash and window_start = v_window for update;
  if v_email >= 3 then return 'rate_limited'; end if;

  insert into public.contact_enquiries (id, name, email, company, service, message)
    values (p_id, p_name, p_email, p_company, p_service, p_message);
  update public.contact_rate_limits set attempts = attempts + 1
    where window_start = v_window and bucket in ('global', p_email_hash);
  delete from public.contact_rate_limits where window_start < v_window - interval '1 day';
  return 'stored';
end;
$$;

revoke all on function public.submit_contact_enquiry(uuid, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_contact_enquiry(uuid, text, text, text, text, text, text)
  to service_role;
