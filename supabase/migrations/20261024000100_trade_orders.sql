-- Trading bounded context: orders are recorded for review; this schema does not
-- settle funds, execute blockchain transfers, or mutate account balances.
create table if not exists public.trade_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  side text not null check (side in ('buy', 'sell')),
  asset_symbol text not null check (char_length(asset_symbol) between 2 and 12),
  network text,
  amount_usd numeric(20, 2) not null check (amount_usd > 0),
  asset_quantity numeric(28, 12) not null check (asset_quantity > 0),
  fee_usd numeric(20, 2) not null check (fee_usd >= 0),
  destination text not null check (char_length(destination) between 3 and 255),
  status text not null default 'pending_review' check (status in ('pending_review', 'completed', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists trade_orders_user_created_idx
  on public.trade_orders (user_id, created_at desc);

alter table public.trade_orders enable row level security;
revoke all on table public.trade_orders from anon, authenticated;
grant select, insert on table public.trade_orders to authenticated;

create policy "Users can read their own trade orders"
  on public.trade_orders for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can submit their own pending trade orders"
  on public.trade_orders for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending_review'
  );
