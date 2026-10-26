# Supabase Setup

The app keeps Supabase behind the Identity bounded context. The domain port and application use cases do not depend on Supabase; the adapter in `src/modules/identity/infrastructure/supabase` translates those use cases to Supabase Auth and Postgres.

## Local development

With Docker Desktop and WSL 2 running, start the local stack from the project root:

```powershell
pnpm dlx supabase start
```

The project already has its Supabase CLI configuration and migrations. The CLI applies pending migrations on startup and prints local connection details. Put only the local API URL and publishable key in the ignored `.env.local` file; never copy the local secret/service-role key into a `NEXT_PUBLIC_` variable. Restart `pnpm dev` after changing `.env.local`.

- Supabase API: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Inbucket email inbox: `http://127.0.0.1:54324`

Local email confirmation is disabled for development. The ignored `.env.local` contains a local-only test account (`BIFIMOTO_TEST_EMAIL` and `BIFIMOTO_TEST_PASSWORD`). It is not a production credential. Stop the stack with `pnpm dlx supabase stop` when finished.

## 1. Connect a Supabase project

Create a Supabase project, then copy its Project URL and publishable key from **Project Settings → API** into a local `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` name is also accepted. Never put a service-role key in a `NEXT_PUBLIC_` variable or in this app's browser code. Restart the Next.js development server after changing environment variables.

## 2. Create the identity and storage schema

Apply every migration in `supabase/migrations` in timestamp order. If you prefer the Supabase CLI, initialize/link this project first, then run `supabase db push`. The migrations create:

- `public.profiles`, associated with `auth.users` by ID. Supabase Auth owns credentials and sessions; the Identity domain owns the app profile and role.
- A trigger that creates the profile when a user is created through email/password, X, or Google.
- A private `profile-avatars` bucket limited to JPEG, PNG, and WebP files up to 5 MB. Storage policies confine each user to objects under their own user-ID folder.
- Row-level security and column grants that let users read/update their own profile while preventing them from changing their `role` or consent timestamps.

An avatar object path must start with the authenticated user's UUID, for example `{user-id}/avatar.webp`. The bucket is private, so serve files with authenticated downloads or short-lived signed URLs.

## 3. Configure Auth URLs

In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000` and add these Redirect URLs:

- `http://localhost:3000/auth/callback`
- Your production app's exact callback URL, such as `https://app.example.com/auth/callback`

Supabase sends email confirmation links to this callback too. The callback exchanges the one-time PKCE code and stores the session in secure cookies.

## 4. Configure Google and X

Enable each provider in **Authentication → Sign In / Providers** and enter that provider's client ID and secret. Configure each OAuth application with the callback URL shown by Supabase for that provider (the Supabase Auth URL, usually `https://<project-ref>.supabase.co/auth/v1/callback`).

- **Google:** Create a Web OAuth client in Google Cloud and add the Supabase callback URL as an authorized redirect URI. Add the local and production app origins as authorized JavaScript origins if requested by Google.
- **X:** Create an X OAuth 2.0 app and request user email access. Use the X / Twitter OAuth 2.0 provider in Supabase; the app calls it as provider `x` (not the legacy OAuth 1.0a provider). Set the Supabase callback URL in the X app.

To grant administrator access, update the account's `public.profiles.role` through the Supabase SQL Editor using a trusted operator account. The client is intentionally not granted permission to change this column.

The app's own `/auth/callback` URL must also be on Supabase's redirect allow list. The provider callback URL and the app callback URL serve different steps in the OAuth flow.

## 5. Auth behavior

- Email/password sign-up creates a Supabase Auth user. Supabase sends the confirmation email; the signup page links back to `/verification-success` after confirmation.
- Profile fields and (for email/password sign-up) consent timestamps are copied from initial signup metadata by a database trigger. They are not client-writable afterward. OAuth provider sign-up currently creates the profile but does not record checkbox consent timestamps.
- Sign-in and signup buttons labeled **Continue with X** and **Continue with Google** use Supabase OAuth 2.0 providers `x` and `google`.
- Protected dashboard pages read the authenticated user and their profile role through the Identity application boundary.

The Trading bounded context stores user-owned buy/sell requests with a `pending_review` status. The later trading security migration applies forced RLS, grants authenticated users only the columns needed to submit their own pending requests, permits admins to read orders, and denies direct client updates/deletes. The admin layout and review API verify the authenticated profile role server-side; a database function independently checks the role and performs a single pending-to-approved/rejected transition while recording the reviewer and timestamp. Rejections require a reason. No service-role key is used by this flow.

Approval only records an admin decision. It does not execute payments, blockchain transfers, or balance changes. Submitted quantity, amount, and fee are user-provided and must not be treated as a trusted quote; implement authoritative pricing, settlement, and ledger workflows in separate domain models before enabling production trading. The support bounded context also still needs its own persistence and policies. These concerns remain outside Identity.
