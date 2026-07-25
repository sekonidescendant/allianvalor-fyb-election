# Allianvalor Decides '26 — Unified Site

Everything in one place: the public election hub, the application form,
the voting booth, live results, and the admin dashboard. One deploy, one
URL, one set of environment variables.

## Pages

- **`/`** — homepage: hero, ballot journey, key dates, position list
- **`/about`** — what the FYB Committee is
- **`/voters`** — how to vote, step by step
- **`/apply`** — candidacy application form
- **`/candidates`** — approved candidates, filterable by position (live)
- **`/vote`** → **`/vote/[position]`** — the ballot
- **`/results`** — live results, auto-refreshing
- **`/news`** — announcements (edit `app/news/page.js` to add posts)
- **`/contact`** — reach the electoral desk
- **`/admin`** — password-protected: approve candidates, upload photos,
  open/close voting, view + export all applications

Every submitted application emails **both**
`Talkwithsekoni@gmail.com` and `Victoriaashefon@gmail.com`, plus an
auto-confirmation to the applicant.

---

## 1. Push to GitHub

This is a **new repo** — separate from your old 3-site setup.

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/allianvalor-decides-26.git
git push -u origin main
```

## 2. Import into Vercel

1. vercel.com → **Add New → Project**
2. Import this new repo
3. Framework auto-detects as Next.js — leave defaults
4. **Don't deploy yet** — add environment variables first

## 3. Environment variables

In **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `GMAIL_USER` | your sending Gmail address |
| `GMAIL_APP_PASSWORD` | 16-character app password (Google Account → Security → 2-Step Verification → App Passwords) |
| `ADMIN_PASSWORD` | a password of your choice — locks `/admin` |
| `REDIS_URL` | see below |

### Getting REDIS_URL

**If you still have your old Redis database** (from the earlier 3-site
setup): reuse it. Go to this **new** project's **Storage** tab → connect
your existing Redis database → it fills in `REDIS_URL` automatically. Your
old application/vote data comes along with it.

**If starting fresh:** Storage tab → add a Redis database (via the
Marketplace, e.g. a provider like Redis Cloud or similar) on the free tier
→ Connect Project → `REDIS_URL` gets added automatically.

## 4. Deploy

Click **Deploy**. Live at `your-project-name.vercel.app`.

---

## Using it

1. Go to `/admin`, log in, approve candidates from submitted applications,
   add photos
2. Click **Open voting** when ready
3. Share the homepage link with your class — from there they can apply,
   browse candidates, or vote, all without leaving the site
4. `/results` is public and live the whole time

## Fill these in before sharing

- **`lib/constants.js`** → `KEY_DATES` (application deadline, voting
  open/close, results date)
- **`app/contact/page.js`** → phone/WhatsApp number
- **`app/news/page.js`** → real announcements as the election progresses

## Local testing (optional)
```
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```
Open http://localhost:3000

## Retiring the old 3 sites

Once this unified site is live and tested, you can safely stop using (or
delete) the old `Allianvalor-Decide-26`, `allianvalor-decides-26-vote`,
and `allianvalor-decides-26-hub` Vercel projects — this one replaces all
three. If they share the same Redis database, deleting the old Vercel
*projects* is safe; just don't delete the Redis database itself.
