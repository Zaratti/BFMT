-- Trading writes are limited to user-submitted requests and an audited,
-- role-checked review transition performed by the database function below.
alter table public.trade_orders
  add column if not exists reviewed_by uuid references public.profiles (id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

alter table public.trade_orders
  alter column user_id set default auth.uid();

alter table public.trade_orders
  drop constraint if exists trade_orders_status_check;

alter table public.trade_orders
  add constraint trade_orders_status_check
  check (status in ('pending_review', 'approved', 'completed', 'rejected'));

alter table public.trade_orders enable row level security;
alter table public.trade_orders force row level security;

drop policy if exists "Users can read their own trade orders" on public.trade_orders;
drop policy if exists "Users can submit their own pending trade orders" on public.trade_orders;
drop policy if exists "Admins can read all trade orders" on public.trade_orders;

create policy "Users can read their own trade orders"
  on public.trade_orders for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Admins can read all trade orders"
  on public.trade_orders for select to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'admin'
    )
  );

create policy "Users can submit their own pending trade orders"
  on public.trade_orders for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending_review'
    and reviewed_by is null
    and reviewed_at is null
    and review_note is null
  );

revoke all on table public.trade_orders from public, anon, authenticated;
grant select on table public.trade_orders to authenticated;
grant insert (
  side,
  asset_symbol,
  network,
  amount_usd,
  asset_quantity,
  fee_usd,
  destination
) on table public.trade_orders to authenticated;

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

  if p_review_note is not null and char_length(p_review_note) > 2000 then
    raise exception using errcode = '22023', message = 'Review note is too long';
  end if;

  update public.trade_orders
  set status = case p_decision when 'approve' then 'approved' else 'rejected' end,
      reviewed_by = acting_user_id,
      reviewed_at = pg_catalog.now(),
      review_note = nullif(pg_catalog.btrim(p_review_note), '')
  where id = p_order_id
    and status = 'pending_review'
  returning * into reviewed_order;

  if not found then
    raise exception using errcode = 'P0002', message = 'Trade order not found or already reviewed';
  end if;

  return reviewed_order;
end;
$$;

revoke all on function public.decide_trade_order(uuid, text, text) from public, anon, authenticated;
grant execute on function public.decide_trade_order(uuid, text, text) to authenticated;
