-- Supabase security lint: handle_new_user() is a SECURITY DEFINER function
-- reachable via the Data API (/rest/v1/rpc/handle_new_user) by any signed-in
-- (and possibly anonymous) caller. It exists solely as an auth.users trigger
-- to create a profile row on signup and was never meant to be called
-- directly — the elevated privileges it needs to bypass RLS on `profiles`
-- are still required (see 00002), so SECURITY DEFINER stays, but there is
-- no reason for it to be exposed through the API surface.
--
-- Revoking EXECUTE here does not affect the auth trigger: Postgres invokes
-- trigger functions directly as part of the INSERT on auth.users, which
-- does not go through the same EXECUTE-privilege check as a direct call.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

-- Prevent any future function in `public` from being auto-exposed to the
-- Data API via the default PUBLIC execute grant. New functions will need
-- an explicit `grant execute ... to anon/authenticated` if they are meant
-- to be callable from the client.
alter default privileges in schema public revoke execute on functions from public;
