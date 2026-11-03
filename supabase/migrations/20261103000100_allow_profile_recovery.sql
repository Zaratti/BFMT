-- Auth remains owned by Supabase Auth. These narrowly scoped grants let users
-- recover a missing profile row and store a verified phone MFA factor's number.
alter table public.profiles add column if not exists phone_number text;
grant insert (id, username, full_name, phone_number) on table public.profiles to authenticated;
grant update (phone_number) on table public.profiles to authenticated;

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
