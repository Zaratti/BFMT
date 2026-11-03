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

Apply every migration in `supabase/migrations` in timestamp order. These migrations do **not** run just because you push code to GitHub or deploy to Vercel. Before deploying code that uses a new migration, apply it to the matching Supabase project. From the repository root, install/use the Supabase CLI and run:

```powershell
pnpm exec supabase login
pnpm exec supabase link --project-ref YOUR_PROJECT_REF
pnpm exec supabase migration list
pnpm exec supabase db push
pnpm exec supabase migration list
```

Replace `YOUR_PROJECT_REF` with the project reference from the Supabase dashboard URL/settings. `db push` may ask for the database password (from Supabase **Project Settings → Database**). Do not put that password in app environment variables or commit it. Check the final migration list and confirm the latest local migrations have been applied. Do not run `supabase db reset` against production; it resets a database.

Alternatively, open the Supabase **SQL Editor**, select the correct production project, and run each unapplied migration file in timestamp order, verifying success before moving to the next. The latest feature migrations are `20261104000100_completed_trade_ledger.sql` followed by `20261105000100_escalate_admin_transaction_lockout.sql`. If a GitHub push automatically triggers Vercel, applying the migrations first avoids deploying code that calls missing database objects.

The migrations create:

- `public.profiles`, associated with `auth.users` by ID. Supabase Auth owns credentials and sessions; the Identity domain owns the app profile and role.
- A secure RPC that records each user's dashboard visits and distinguishes a return within 24 hours.
- A trigger that creates the profile when a user is created through email/password, X, or Google.
- A `phone_number` profile field for a phone number that has been verified as a Supabase phone MFA factor. Phone is optional; authentication factors remain managed by Supabase Auth.
- A private `profile-avatars` bucket limited to JPEG, PNG, and WebP files up to 5 MB. Storage policies confine each user to objects under their own user-ID folder.
- Row-level security and column grants that let users read/update their own profile and recover a missing profile row without allowing them to change their `role` or consent timestamps.
- A private completed-trade ledger, admin-only completion flow with a separate salted password hash and progressive lockout, and admin-managed fixed-fee tiers by asset, side, and USD amount range.

An avatar object path must start with the authenticated user's UUID, for example `{user-id}/avatar.webp`. The bucket is private, so serve files with authenticated downloads or short-lived signed URLs.

## 3. Configure Auth URLs

In **Authentication → URL Configuration**, set the Site URL to your production canonical URL, for example `https://www.bifimoto.com`. Add these Redirect URLs:

- `http://localhost:3000/auth/callback` for local development
- `https://www.bifimoto.com/auth/callback` for production
- `https://bifimoto.com/auth/callback` too if the root domain is not redirected to `www` before the callback

The app passes the current site's `/auth/callback` URL to Supabase during signup and OAuth, and the callback exchanges the one-time PKCE code and stores the session in secure cookies. Email confirmation returns verified users to `/dashboard`. After changing these settings, submit a fresh signup to receive a link with the updated redirect; existing emails keep the redirect they were created with.

## 4. Brand authentication emails

In **Authentication → Email Templates**, edit the confirmation template's subject and body to use your Bifimoto name and wording. Keep Supabase's confirmation link variable (commonly `{{ .ConfirmationURL }}`) in the confirmation action so the link still completes verification and returns through `/auth/callback`.

For a branded From name and address, configure a custom SMTP provider in the project's Auth SMTP settings and use an address on a domain you control that the provider has verified. Update SPF/DKIM records as directed by that email provider. Do not put SMTP credentials in the app's `NEXT_PUBLIC_` environment variables.

## 5. Configure Google and X

Enable each provider in **Authentication → Sign In / Providers** and enter that provider's client ID and secret. Configure each OAuth application with the callback URL shown by Supabase for that provider (the Supabase Auth URL, usually `https://<project-ref>.supabase.co/auth/v1/callback`).

- **Google:** Create a Web OAuth client in Google Cloud and add the Supabase callback URL as an authorized redirect URI. Add the local and production app origins as authorized JavaScript origins if requested by Google.
- **X:** Create an X OAuth 2.0 app and request user email access. Use the X / Twitter OAuth 2.0 provider in Supabase; the app calls it as provider `x` (not the legacy OAuth 1.0a provider). Set the Supabase callback URL in the X app.

To grant administrator access, update the account's `public.profiles.role` through the Supabase SQL Editor using a trusted operator account. The client is intentionally not granted permission to change this column.

The app's own `/auth/callback` URL must also be on Supabase's redirect allow list. The provider callback URL and the app callback URL serve different steps in the OAuth flow.

## 6. Configure phone MFA

Phone-based two-factor authentication is optional and is managed as a Supabase Auth phone factor. Before users enable it, configure an SMS provider under the Supabase project's **Authentication** phone/MFA settings and test that provider's delivery. The app enrolls the user's E.164 phone number, sends an SMS challenge, and marks MFA enabled only after the user enters the valid code. A verified phone factor is also required to verify password changes when MFA is enabled. Email SMTP (Brevo) does not send MFA SMS messages.

The app stores the verified phone number in the user's own `public.profiles.phone_number` field for display; Supabase Auth remains the authority for factor verification. The latest profile migration grants only the needed own-profile insert/update columns. Apply all migrations to the production Supabase project before using these settings.

Admins should set the separate transaction password in **Dashboard → Settings** before confirming an approved trade request. Use at least 8 characters, including uppercase and lowercase letters, a number, and a symbol. The database stores only a salted bcrypt hash. Each block of five failed completion attempts locks completion progressively: first 2 hours, next 12 hours, then 24 hours. Five further failed attempts after the 24-hour lockout require a project-owner reset. The settings page tells the admin when this is required. A password change before that point requires the current transaction password.

For a reset-required credential, a trusted Supabase project owner should identify the correct admin account in the SQL Editor and delete only that admin's credential row. For example, replace the email below with the admin's account email and run:

```sql
delete from public.admin_transaction_credentials
where admin_id = (
  select id from auth.users where email = 'admin@example.com'
);
```

Then have that admin sign in, open **Dashboard → Settings**, and create a new transaction password. This recovery requires trusted database-owner access by design; do not expose a client-side bypass or share transaction passwords.

Configure fixed fee tiers in **Admin → Rate Management** for each asset/rail and buy/sell side. A range includes its minimum and excludes its maximum; leave maximum empty for an unbounded top range. Overlapping ranges for the same asset and side are rejected, and the fee cannot exceed the tier's minimum order amount. Buy/sell forms intentionally block submission when no fee tier applies.

## 7. Auth behavior

- Email/password sign-up creates a Supabase Auth user. Supabase sends the confirmation email; the callback exchanges the verification code, establishes the Supabase session, and sends the user to `/dashboard`.
- Profile fields and (for email/password sign-up) consent timestamps are copied from initial signup metadata by a database trigger. They are not client-writable afterward. OAuth provider sign-up currently creates the profile but does not record checkbox consent timestamps.
- Sign-in and signup buttons labeled **Continue with X** and **Continue with Google** use Supabase OAuth 2.0 providers `x` and `google`.
- Protected dashboard pages read the authenticated Supabase Auth user and their profile role/username through the Identity application boundary. The settings page shows the Auth user's email and confirmation status, not a separately editable profile email.
- Phone MFA enrollment is optional. When an enrolled factor exists, password changes require a fresh successful SMS challenge.

The Trading bounded context stores user-owned buy/sell requests with a `pending_review` status. The trading security migration applies forced RLS, grants authenticated users only the columns needed to submit their own pending requests, permits admins to read orders, and denies direct client updates/deletes. Admins may approve pending requests, reject pending/approved requests with a required reason, or manually mark an approved request completed. Completion atomically changes the order and creates one immutable ledger entry; it requires the separate admin transaction password. No service-role key is used by this flow.

Approval only records an admin decision. Completion records that an administrator manually confirmed external settlement; it does not execute payments, blockchain transfers, or payouts. The dashboard's “Portfolio Balance” is the sum of USD amounts in completed buy and sell records, not a wallet balance, holdings valuation, or withdrawable funds. The app's server-only Trading adapter fetches Kraken's public ticker endpoint with an 8-second timeout; the route returns only validated prices for the supported asset symbols and caches the result for 30 seconds. The browser requests this public-price route without sending session cookies; the server uses no Kraken credentials and does not forward user data to Kraken. Prices are public market data, so the endpoint itself is intentionally public; it contains no account or portfolio information. The database validates each submitted fee against the configured tier. The quoted price/quantity remains a user request and must be independently verified before any external settlement. Kraken availability can vary by pair; unavailable prices block the affected request. The support bounded context also still needs its own persistence and policies. These concerns remain outside Identity.
