create extension if not exists pgcrypto with schema extensions;

alter table public.profiles
  add column if not exists last_dashboard_visit_at timestamptz;

create or replace function public.record_dashboard_visit()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user_id uuid := (select auth.uid());
  previous_visit timestamptz;
begin
  if acting_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  select profiles.last_dashboard_visit_at
  into previous_visit
  from public.profiles
  where profiles.id = acting_user_id
  for update;

  insert into public.profiles (id, last_dashboard_visit_at)
  values (acting_user_id, pg_catalog.now())
  on conflict (id) do update
    set last_dashboard_visit_at = excluded.last_dashboard_visit_at;

  return previous_visit is not null
    and previous_visit >= pg_catalog.now() - interval '24 hours';
end;
$$;

revoke all on function public.record_dashboard_visit() from public, anon;
grant execute on function public.record_dashboard_visit() to authenticated;

alter table public.trade_orders
  add column if not exists completed_by uuid references public.profiles (id),
  add column if not exists completed_at timestamptz;

create table if not exists public.trade_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.trade_orders (id),
  user_id uuid not null references auth.users (id) on delete cascade,
  side text not null check (side in ('buy', 'sell')),
  asset_symbol text not null,
  amount_usd numeric(20, 2) not null check (amount_usd > 0),
  fee_usd numeric(20, 2) not null check (fee_usd >= 0),
  asset_quantity numeric(28, 12) not null check (asset_quantity > 0),
  completed_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index if not exists trade_ledger_entries_user_created_idx
  on public.trade_ledger_entries (user_id, created_at desc);

alter table public.trade_ledger_entries enable row level security;
revoke all on table public.trade_ledger_entries from public, anon, authenticated;
grant select on table public.trade_ledger_entries to authenticated;

create policy "Users can read their own ledger entries"
  on public.trade_ledger_entries for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can read all ledger entries"
  on public.trade_ledger_entries for select to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );

create table if not exists public.admin_transaction_credentials (
  admin_id uuid primary key references public.profiles (id) on delete cascade,
  password_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.admin_transaction_credentials enable row level security;
revoke all on table public.admin_transaction_credentials from public, anon, authenticated;

create or replace function public.has_admin_transaction_password()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_transaction_credentials
    where admin_id = (select auth.uid())
  );
$$;

revoke all on function public.has_admin_transaction_password() from public, anon;
grant execute on function public.has_admin_transaction_password() to authenticated;

create or replace function public.set_admin_transaction_password(
  p_password text,
  p_current_password text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user_id uuid := (select auth.uid());
  existing_hash text;
begin
  if acting_user_id is null or not exists (
    select 1 from public.profiles
    where id = acting_user_id and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  perform 1
  from public.profiles
  where id = acting_user_id
  for update;

  if p_password is null
    or pg_catalog.char_length(p_password) < 8
    or p_password !~ '[A-Z]'
    or p_password !~ '[a-z]'
    or p_password !~ '[0-9]'
    or p_password !~ '[^A-Za-z0-9]' then
    raise exception using errcode = '22023',
      message = 'Use at least 8 characters with an uppercase letter, lowercase letter, number, and symbol.';
  end if;

  select password_hash into existing_hash
  from public.admin_transaction_credentials
  where admin_id = acting_user_id
  for update;

  if existing_hash is not null then
    if p_current_password is null
      or extensions.crypt(p_current_password, existing_hash) <> existing_hash then
      raise exception using errcode = '42501', message = 'Current transaction password is incorrect.';
    end if;

    update public.admin_transaction_credentials
    set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
        failed_attempts = 0,
        locked_until = null,
        updated_at = pg_catalog.now()
    where admin_id = acting_user_id;
  else
    insert into public.admin_transaction_credentials (admin_id, password_hash)
    values (acting_user_id, extensions.crypt(p_password, extensions.gen_salt('bf', 12)));
  end if;

  return 'saved';
end;
$$;

revoke all on function public.set_admin_transaction_password(text, text) from public, anon;
grant execute on function public.set_admin_transaction_password(text, text) to authenticated;

create or replace function public.complete_trade_order(
  p_order_id uuid,
  p_transaction_password text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user_id uuid := (select auth.uid());
  credential public.admin_transaction_credentials;
  reviewed_order public.trade_orders;
begin
  if acting_user_id is null or not exists (
    select 1 from public.profiles
    where id = acting_user_id and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  select * into credential
  from public.admin_transaction_credentials
  where admin_id = acting_user_id
  for update;

  if not found then
    return 'transaction_password_not_set';
  end if;

  if credential.locked_until is not null and credential.locked_until > pg_catalog.now() then
    return 'transaction_password_locked';
  end if;

  if p_transaction_password is null
    or extensions.crypt(p_transaction_password, credential.password_hash) <> credential.password_hash then
    if credential.failed_attempts + 1 >= 5 then
      update public.admin_transaction_credentials
      set failed_attempts = 0,
          locked_until = pg_catalog.now() + interval '15 minutes'
      where admin_id = acting_user_id;
      return 'transaction_password_locked';
    end if;

    update public.admin_transaction_credentials
    set failed_attempts = credential.failed_attempts + 1,
        locked_until = null
    where admin_id = acting_user_id;
    return 'invalid_transaction_password';
  end if;

  select * into reviewed_order
  from public.trade_orders
  where id = p_order_id
  for update;

  if not found or reviewed_order.status <> 'approved' then
    raise exception using errcode = 'P0002', message = 'Order is not awaiting completion';
  end if;

  insert into public.trade_ledger_entries (
    order_id, user_id, side, asset_symbol, amount_usd, fee_usd,
    asset_quantity, completed_by
  )
  values (
    reviewed_order.id,
    reviewed_order.user_id,
    reviewed_order.side,
    reviewed_order.asset_symbol,
    reviewed_order.amount_usd,
    reviewed_order.fee_usd,
    reviewed_order.asset_quantity,
    acting_user_id
  );

  update public.trade_orders
  set status = 'completed',
      completed_by = acting_user_id,
      completed_at = pg_catalog.now()
  where id = reviewed_order.id;

  update public.admin_transaction_credentials
  set failed_attempts = 0,
      locked_until = null,
      updated_at = pg_catalog.now()
  where admin_id = acting_user_id;

  return 'completed';
end;
$$;

revoke all on function public.complete_trade_order(uuid, text) from public, anon;
grant execute on function public.complete_trade_order(uuid, text) to authenticated;

create or replace function public.decide_trade_order(
  p_order_id uuid,
  p_decision text,
  p_review_note text default null
)
returns public.trade_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user_id uuid := (select auth.uid());
  reviewed_order public.trade_orders;
begin
  if acting_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles
    where profiles.id = acting_user_id
      and profiles.role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  if p_decision is null or p_decision not in ('approve', 'reject') then
    raise exception using errcode = '22023', message = 'Invalid review decision';
  end if;

  if p_decision = 'reject' and nullif(pg_catalog.btrim(p_review_note), '') is null then
    raise exception using errcode = '22023', message = 'A rejection reason is required';
  end if;

  if p_review_note is not null and pg_catalog.char_length(p_review_note) > 2000 then
    raise exception using errcode = '22023', message = 'Review note is too long';
  end if;

  update public.trade_orders
  set status = case p_decision when 'approve' then 'approved' else 'rejected' end,
      reviewed_by = acting_user_id,
      reviewed_at = pg_catalog.now(),
      review_note = nullif(pg_catalog.btrim(p_review_note), '')
  where id = p_order_id
    and (
      (p_decision = 'approve' and status = 'pending_review')
      or (p_decision = 'reject' and status in ('pending_review', 'approved'))
    )
  returning * into reviewed_order;

  if not found then
    raise exception using errcode = 'P0002', message = 'Trade order not found or already reviewed';
  end if;

  return reviewed_order;
end;
$$;

revoke all on function public.decide_trade_order(uuid, text, text) from public, anon, authenticated;
grant execute on function public.decide_trade_order(uuid, text, text) to authenticated;

create table if not exists public.trade_fee_tiers (
  id uuid primary key default gen_random_uuid(),
  side text not null check (side in ('buy', 'sell')),
  asset_symbol text not null check (asset_symbol ~ '^[A-Z0-9]{2,12}$'),
  minimum_usd numeric(20, 2) not null check (minimum_usd >= 0),
  maximum_usd numeric(20, 2),
  fee_usd numeric(20, 2) not null check (fee_usd >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (maximum_usd is null or maximum_usd > minimum_usd)
);

create index if not exists trade_fee_tiers_lookup_idx
  on public.trade_fee_tiers (side, asset_symbol, minimum_usd);

alter table public.trade_fee_tiers enable row level security;
revoke all on table public.trade_fee_tiers from public, anon, authenticated;
grant select on table public.trade_fee_tiers to authenticated;

create policy "Authenticated users can read trade fee tiers"
  on public.trade_fee_tiers for select to authenticated
  using (true);

create or replace function public.get_trade_fee(
  p_side text,
  p_asset_symbol text,
  p_amount_usd numeric
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select fee_usd
  from public.trade_fee_tiers
  where side = p_side
    and asset_symbol = p_asset_symbol
    and minimum_usd <= p_amount_usd
    and (maximum_usd is null or p_amount_usd < maximum_usd)
  order by minimum_usd desc
  limit 1;
$$;

revoke all on function public.get_trade_fee(text, text, numeric) from public, anon;
grant execute on function public.get_trade_fee(text, text, numeric) to authenticated;

create or replace function public.validate_trade_order_fee()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  expected_fee numeric;
begin
  expected_fee := public.get_trade_fee(new.side, new.asset_symbol, new.amount_usd);
  if expected_fee is null then
    raise exception using errcode = '22023', message = 'No fee tier is configured for this order.';
  end if;
  if new.fee_usd is distinct from expected_fee then
    raise exception using errcode = '22023', message = 'The submitted fee does not match the configured fee tier.';
  end if;
  return new;
end;
$$;

revoke all on function public.validate_trade_order_fee() from public, anon, authenticated;
drop trigger if exists validate_trade_order_fee on public.trade_orders;
create trigger validate_trade_order_fee
  before insert on public.trade_orders
  for each row execute function public.validate_trade_order_fee();

create or replace function public.save_trade_fee_tier(
  p_tier_id uuid,
  p_side text,
  p_asset_symbol text,
  p_minimum_usd numeric,
  p_maximum_usd numeric,
  p_fee_usd numeric
)
returns public.trade_fee_tiers
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user_id uuid := (select auth.uid());
  saved_tier public.trade_fee_tiers;
begin
  if acting_user_id is null or not exists (
    select 1 from public.profiles
    where id = acting_user_id and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  if p_side not in ('buy', 'sell')
    or p_asset_symbol !~ '^[A-Z0-9]{2,12}$'
    or p_minimum_usd < 0
    or (p_maximum_usd is not null and p_maximum_usd <= p_minimum_usd)
    or p_fee_usd < 0
    or p_fee_usd > p_minimum_usd then
    raise exception using errcode = '22023', message = 'Invalid fee tier values';
  end if;

  lock table public.trade_fee_tiers in share row exclusive mode;

  if exists (
    select 1 from public.trade_fee_tiers tier
    where tier.side = p_side
      and tier.asset_symbol = p_asset_symbol
      and tier.id is distinct from p_tier_id
      and (p_maximum_usd is null or tier.minimum_usd < p_maximum_usd)
      and (tier.maximum_usd is null or p_minimum_usd < tier.maximum_usd)
  ) then
    raise exception using errcode = '22023',
      message = 'This fee range overlaps another tier for the same asset and transaction side.';
  end if;

  if p_tier_id is null then
    insert into public.trade_fee_tiers (side, asset_symbol, minimum_usd, maximum_usd, fee_usd)
    values (p_side, p_asset_symbol, p_minimum_usd, p_maximum_usd, p_fee_usd)
    returning * into saved_tier;
  else
    update public.trade_fee_tiers
    set side = p_side,
        asset_symbol = p_asset_symbol,
        minimum_usd = p_minimum_usd,
        maximum_usd = p_maximum_usd,
        fee_usd = p_fee_usd,
        updated_at = pg_catalog.now()
    where id = p_tier_id
    returning * into saved_tier;
    if not found then
      raise exception using errcode = 'P0002', message = 'Fee tier not found';
    end if;
  end if;

  return saved_tier;
end;
$$;

revoke all on function public.save_trade_fee_tier(uuid, text, text, numeric, numeric, numeric) from public, anon;
grant execute on function public.save_trade_fee_tier(uuid, text, text, numeric, numeric, numeric) to authenticated;

create or replace function public.delete_trade_fee_tier(p_tier_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  acting_user_id uuid := (select auth.uid());
begin
  if acting_user_id is null or not exists (
    select 1 from public.profiles
    where id = acting_user_id and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  delete from public.trade_fee_tiers where id = p_tier_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Fee tier not found';
  end if;
end;
$$;

revoke all on function public.delete_trade_fee_tier(uuid) from public, anon;
grant execute on function public.delete_trade_fee_tier(uuid) to authenticated;
