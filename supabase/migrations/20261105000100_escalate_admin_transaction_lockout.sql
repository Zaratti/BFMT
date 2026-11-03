alter table public.admin_transaction_credentials
  add column if not exists lockout_stage smallint not null default 0,
  add column if not exists reset_required boolean not null default false;

alter table public.admin_transaction_credentials
  drop constraint if exists admin_transaction_credentials_lockout_stage_check;

alter table public.admin_transaction_credentials
  add constraint admin_transaction_credentials_lockout_stage_check
  check (lockout_stage between 0 and 3);

create or replace function public.get_admin_transaction_password_status()
returns text
language sql
security definer
set search_path = ''
as $$
  select case
    when not exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'admin'
    ) then 'not_admin'
    when not exists (
      select 1
      from public.admin_transaction_credentials
      where admin_id = (select auth.uid())
    ) then 'not_set'
    when exists (
      select 1
      from public.admin_transaction_credentials
      where admin_id = (select auth.uid())
        and reset_required
    ) then 'reset_required'
    else 'configured'
  end;
$$;

revoke all on function public.get_admin_transaction_password_status() from public, anon;
grant execute on function public.get_admin_transaction_password_status() to authenticated;

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
  existing_credential public.admin_transaction_credentials;
begin
  if acting_user_id is null or not exists (
    select 1 from public.profiles
    where id = acting_user_id and role = 'admin'
  ) then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  if p_password is null
    or pg_catalog.char_length(p_password) < 8
    or p_password !~ '[A-Z]'
    or p_password !~ '[a-z]'
    or p_password !~ '[0-9]'
    or p_password !~ '[^A-Za-z0-9]' then
    raise exception using errcode = '22023',
      message = 'Use at least 8 characters with an uppercase letter, lowercase letter, number, and symbol.';
  end if;

  select * into existing_credential
  from public.admin_transaction_credentials
  where admin_id = acting_user_id
  for update;

  if found then
    if existing_credential.reset_required then
      raise exception using errcode = '42501',
        message = 'A trusted project owner must reset this transaction password before a new one can be set.';
    end if;

    if existing_credential.locked_until is not null
      and existing_credential.locked_until > pg_catalog.now() then
      raise exception using errcode = '42501',
        message = 'The transaction password is locked until the lockout period expires.';
    end if;

    if p_current_password is null
      or extensions.crypt(p_current_password, existing_credential.password_hash) <> existing_credential.password_hash then
      raise exception using errcode = '42501', message = 'Current transaction password is incorrect.';
    end if;

    update public.admin_transaction_credentials
    set password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 12)),
        failed_attempts = 0,
        locked_until = null,
        lockout_stage = 0,
        reset_required = false,
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

  if credential.reset_required then
    return 'transaction_password_reset_required';
  end if;

  if credential.locked_until is not null and credential.locked_until > pg_catalog.now() then
    return case credential.lockout_stage
      when 1 then 'transaction_password_locked_2_hours'
      when 2 then 'transaction_password_locked_12_hours'
      when 3 then 'transaction_password_locked_24_hours'
      else 'transaction_password_locked'
    end;
  end if;

  if p_transaction_password is null
    or extensions.crypt(p_transaction_password, credential.password_hash) <> credential.password_hash then
    if credential.failed_attempts + 1 < 5 then
      update public.admin_transaction_credentials
      set failed_attempts = credential.failed_attempts + 1,
          locked_until = null
      where admin_id = acting_user_id;
      return 'invalid_transaction_password';
    end if;

    if credential.lockout_stage = 3 then
      update public.admin_transaction_credentials
      set failed_attempts = 0,
          locked_until = null,
          reset_required = true,
          updated_at = pg_catalog.now()
      where admin_id = acting_user_id;
      return 'transaction_password_reset_required';
    end if;

    update public.admin_transaction_credentials
    set failed_attempts = 0,
        lockout_stage = credential.lockout_stage + 1,
        locked_until = pg_catalog.now() + case credential.lockout_stage
          when 0 then interval '2 hours'
          when 1 then interval '12 hours'
          else interval '24 hours'
        end
    where admin_id = acting_user_id;

    return case credential.lockout_stage
      when 0 then 'transaction_password_locked_2_hours'
      when 1 then 'transaction_password_locked_12_hours'
      else 'transaction_password_locked_24_hours'
    end;
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
      lockout_stage = 0,
      updated_at = pg_catalog.now()
  where admin_id = acting_user_id;

  return 'completed';
end;
$$;

revoke all on function public.complete_trade_order(uuid, text) from public, anon;
grant execute on function public.complete_trade_order(uuid, text) to authenticated;
