-- Fix "Database error saving new user" on signup.
--
-- The handle_new_user trigger inserts into profiles, which has RLS enabled.
-- Even with SECURITY DEFINER, the function must be owned by a superuser/postgres
-- role to bypass RLS. Re-create the function with explicit SET search_path and
-- ensure it is owned by postgres so SECURITY DEFINER actually bypasses RLS.
-- Also grant execute to the supabase_auth_admin role that fires auth triggers.

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Ensure the auth trigger still exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
