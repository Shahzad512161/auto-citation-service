# Global Citation Auto Blaster

A worldwide business listing auto-poster with Google Login. One business, 1000 directories.

**Stack:** Next.js 14 (React) + Tailwind + Lucide icons + Firebase Auth/Firestore. White background, black text, primary `#0F6FFF`.

## Run it right now

```bash
npm run dev
# open http://localhost:3000
```

Firebase credentials are integrated via `.env.local` for project `auto-citation-3cb9f`.

## Real Google Login (Firebase)
1. Go to [Firebase Console](https://console.firebase.google.com/) -> Build -> Authentication -> Sign-in method.
2. Enable **Google** and **Email/Password**.
3. Under Firestore Database, ensure your rules allow authenticated user writes.

Any Gmail works — personal `@gmail.com` or business `@company.com` (Google Workspace) — because Google OAuth accepts any Google account.

## Directory seed — what is real and what is a starter list

- **USA: 1,045 rows** — imported from a verified seed file (name, direct add-listing URL, DA). The app's "USA (1000)" target is met and exceeded.
- **UK: 22 rows** — imported from a verified UK seed file (DA included; 3 flows were live-verified in Oct 2026: Yell, FreeIndex, Scoot).
- **Australia / Canada / UAE / Saudi Arabia / Pakistan / India: starter lists (6–12 each)** of well-known directories + the global platforms (Bing Places, Apple Business Connect, Facebook, Google). DA shows "—" for these because no verified DA was on file — inventing one would be worse.
- **Tab counts are real loaded rows**, not the spec's target sizes (USA 1000, UK 500, Australia 300, Canada 300, UAE 100, Saudi 100, Pakistan 200, India 200). Grow any country with "+ Add Custom Directory", or import more rows into `lib/store.js` / the Supabase `directories` table.
- **Type "Free" on seed rows is the demo-seed default** — verify pricing on the directory's own site before paying anything.

## Honest limits (read before demoing to a client)

1. **No tool can submit a form on another website without that site's cooperation or a human click.** The blaster therefore opens the real add-listing pages in batches (3/5/10 tabs, 1/2/5s delay), saves the business data to localStorage key `blaster_business_data`, and gives you an **auto-fill bookmarklet** (business data embedded in it) that fills name/phone/email/address/city/state/zip/country/website/description/category on the directory's own form. You review and submit each form. A listing is only marked "Live" in Reports when you set it and paste its live URL.
2. **Stripe checkout is a simulation** in this MVP: it shows a checkout form and activates the plan locally, but takes no real payment. Replace `confirmCheckout` in `app/dashboard/subscription/page.js` with a real Stripe Checkout Session to charge for real.
3. **Screenshots in Reports** are not auto-captured (directories offer no screenshot API). The table records status + live URL; capture a screenshot yourself if a client needs one.
4. **Auto-fetch** uses `https://api.allorigins.win/get?url=` exactly as specified. If a site blocks the proxy, the form still works manually — scraped data must always be reviewed before saving.
5. **Demo mode stores data in localStorage only** (per browser). With Supabase connected, the schema is ready for the same tables; the current pages still write to localStorage first, so treat Supabase sync as the next integration step if you want server-side persistence.
