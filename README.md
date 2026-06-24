# EcoVities — Mobile App

React + Vite + Supabase. Student and business mobile wallet for institutional digital currency.

---

## What's in this repo

```
ecovities/
├── src/
│   ├── views/          All screens (Home, Pay, Receive, Scan, History, Profile, Notifications, Contacts)
│   ├── components/     AppShell, BottomNav, Avatar
│   ├── hooks/          useWallet (real-time balance), useNotifications (real-time badge)
│   ├── context/        AuthContext (session + account state)
│   ├── lib/            supabaseClient.ts, api.ts (all data access)
│   └── types/          index.ts (shared TypeScript types)
├── supabase/
│   ├── migrations/     Run these in order in your Supabase project
│   │   ├── 0001_core_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   ├── 0003_functions.sql
│   │   └── 0004_realtime.sql
│   ├── functions/
│   │   ├── approve-student/
│   │   └── transfer/
│   └── seed.sql
└── .env.example
```

---

## Setup

### 1. Create a Supabase project

Go to supabase.com → New project. Note your Project URL and anon public key (Settings → API).

### 2. Run migrations

In Supabase → SQL Editor, run each file in order:
- 0001_core_schema.sql
- 0002_rls_policies.sql
- 0003_functions.sql
- 0004_realtime.sql

### 3. Seed test accounts

Create auth users in Supabase → Authentication → Users → Add user:

| Email | Password | Role |
|---|---|---|
| john@example.com | test1234 | Student |
| alice@example.com | test1234 | Student |
| greencafe@example.com | test1234 | Business |

Copy each user's UUID, open supabase/seed.sql, uncomment the INSERT blocks,
fill in the UUIDs, then run in SQL editor.

### 4. Deploy Edge Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy approve-student
supabase functions deploy transfer
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 5. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 6. Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Sign in with john@example.com / test1234.

---

## Deploy to production

```bash
npm run build
```

Deploy the dist/ folder to Vercel, Netlify, or Cloudflare Pages.
Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your host's env settings.

---

## Architecture notes

- Wallets are never client-writable. All balance changes go through Edge Functions
  (service role). RLS has no UPDATE policy on wallets for the authenticated role.
- Balances stored as bigint (integer EcoPoints). Never floats.
- One accounts table for students and businesses. account_type is a flag.
- useWallet subscribes to postgres_changes on the wallet row for real-time balance.

---

## What's next

- Institution Admin panel (Phase 3) — separate Vite app in /apps/admin
- Business account creation by institution admin
- Merchant API key generation (deferred)
- Push notifications via PWA service worker
