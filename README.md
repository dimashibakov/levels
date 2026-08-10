# LEVELS — alpha

A private, stepped mental-health check with a spirit-level read. Single-user alpha.
Stack: **Next.js 14 · TypeScript · Tailwind · Supabase · Vercel**.

Design reference: the LEVELS Brand Book & Product Spec (Notion) and the HTML mockup.

---

## What's inside

```
app/
  (app)/today | patterns | playbook   # tabbed screens
  onboarding/                         # 4-step first run
  check/                              # stepped screening + server action
components/  LevelVial · TabBar
lib/         scoring.ts (+ test) · i18n · supabase/{client,server}
supabase/migrations/0001_init.sql     # 3 tables + RLS
```

The tier decision lives in **`lib/scoring.ts`** only. Thresholds there are DEMO
values — swap for validated PHQ-9 / C-SSRS cutoffs before leaving alpha.

---

## 1 · Create the repo & push (GitHub — you do this)

```bash
cd levels
git init
git add .
git commit -m "LEVELS alpha scaffold"
git branch -M main
# create an empty repo named "levels" on github.com, then:
git remote add origin git@github.com:<you>/levels.git
git push -u origin main
```

## 2 · Supabase

1. Create a project (or let it be created via the connector).
2. Set env from **Project Settings → API** (see `.env.example`) into `.env.local`.
3. Apply the migration:
   ```bash
   # option A — CLI
   supabase link --project-ref <ref>
   supabase db push
   # option B — paste supabase/migrations/0001_init.sql into the SQL editor
   ```
4. **Auth → Providers → Google**: enable, add your OAuth client. (Alpha: just you.)

## 3 · Run locally in Cursor

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
npm test                     # scoring unit tests
```

The app runs even before Supabase is wired — the check computes your tier
locally and simply doesn't persist until env + a signed-in user exist.

## 4 · Deploy on Vercel

Import the GitHub repo, add the same env vars (Production + Preview), deploy.
`main` → production, every PR → preview.

---

## Guardrails baked in

- Help is never server-dependent: the 988 number and plan render client-side.
- No automatic emergency dispatch anywhere. The edge path routes to a human.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only — never import it in a client file.

> Alpha disclaimer: not a medical device or diagnostic tool. Items are
> plain-language adaptations of open instruments, not validated versions.
