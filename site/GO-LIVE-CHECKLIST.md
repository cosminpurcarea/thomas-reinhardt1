# Go-live checklist — thomas-reinhardt.com

Use this list before pointing real traffic at production. Your domain is registered on **Hostinger**; you can keep almost all “domain work” there (DNS, optional email mailboxes) while the Next.js app is usually hosted elsewhere (recommended: **Vercel**) or on Hostinger if you prefer a single vendor for hosting too.

---

## 1. Hosting choice (Hostinger + app)

| Approach | Hostinger | App |
|----------|-----------|-----|
| **Recommended for this Next.js stack** | Domain + **DNS** (and optional email) | **Vercel** (or similar) — connect the Git repo, deploy, add custom domain |
| **All-in on Hostinger** | Domain + DNS + **web hosting** that supports **Node.js** and your Next.js version | Deploy the `site` app per Hostinger’s Node/Next docs; verify build output and Node version |

**Using Hostinger “as much as possible” in practice**

- Keep the **domain** and manage **DNS** in Hostinger (required for any external host).
- Optionally create **mailboxes** at Hostinger (e.g. `contact@thomas-reinhardt.com`) for *receiving* mail; the website can still *send* via **Resend** using the same domain after DNS verification (see §5).
- If you do **not** use Vercel, repeat this checklist’s DNS/SSL sections for your chosen host’s required records.

---

## 2. Domain, DNS, and SSL (Hostinger)

- [ ] In Hostinger, set **nameservers** to the provider you use for DNS (Hostinger default nameservers are fine if you edit DNS in hPanel).
- [ ] **Apex domain** `thomas-reinhardt.com`: add the **A / ALIAS / ANAME** records your host gives you (Vercel: use their documented apex records or their DNS integration).
- [ ] **www** `www.thomas-reinhardt.com`: **CNAME** to your host’s target (e.g. Vercel’s `cname.vercel-dns.com` or the value shown in the Vercel domain UI).
- [ ] Choose one canonical URL: **apex vs www** — redirect the other in your host (Vercel: redirect in project settings) so you don’t split SEO.
- [ ] Wait for DNS propagation (often minutes, sometimes up to 48h); verify with `dig` or an online DNS checker.
- [ ] **HTTPS**: enable SSL on the hosting side (Vercel issues certificates automatically after DNS is correct).

---

## 3. Environment variables (production)

Set these in your **production** environment (e.g. Vercel → Project → Settings → Environment Variables). Match `.env.example` and your app needs.

**Required for a working live site**

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://thomas-reinhardt.com` or `https://www.thomas-reinhardt.com` — **no trailing slash**, must match what users type in the browser. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Production** Clerk key (not `pk_test_…` for real users). |
| `CLERK_SECRET_KEY` | Production secret (`sk_live_…`). |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID. |
| `NEXT_PUBLIC_SANITY_DATASET` | e.g. `production` |
| `SANITY_API_TOKEN` | Token with read/write as needed for your API routes / Studio. |
| `RESEND_API_KEY` | Production API key. |
| `RESEND_FROM_EMAIL` | e.g. `contact@thomas-reinhardt.com` — must be allowed by Resend. |
| `CONTACT_TO_EMAIL` | Inbox for contact form (often same domain). |
| `ADMIN_EMAILS` | Comma-separated admin emails for `/admin` and email triggers. |

**Recommended**

| Variable | Notes |
|----------|--------|
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | Long random string dedicated to signing unsubscribe links (else the app falls back to `CLERK_SECRET_KEY`). |

After changing env vars, **redeploy** so server and client bundles pick up `NEXT_PUBLIC_*` values.

---

## 4. Clerk (production)

- [ ] Create or switch the Clerk instance to **production** keys for live users.
- [ ] **Allowed origins / redirect URLs**: add `https://thomas-reinhardt.com` and `https://www.thomas-reinhardt.com` (and preview URLs if you use them).
- [ ] **Sign-in / sign-up URLs** match your app: `/sign-in`, `/sign-up`.
- [ ] Test OAuth providers (Google, LinkedIn, X) in production if enabled.

---

## 5. Resend and email DNS (can use Hostinger DNS)

- [ ] In Resend, **add domain** `thomas-reinhardt.com` (or the subdomain you send from).
- [ ] In **Hostinger → DNS**, add the **TXT / MX / DKIM** records Resend shows (SPF, DKIM, etc.).
- [ ] Wait until Resend marks the domain **verified**.
- [ ] Send a test: contact form + newsletter/release email; confirm inbox and that **logo / links** use `NEXT_PUBLIC_SITE_URL`.

---

## 6. Sanity

- [ ] CORS / allowed origins include your production URL (Sanity project settings).
- [ ] Dataset and API token permissions match what production routes need (read-only vs write for uploads).

---

## 7. Security and secrets

- [ ] `.env.local` is **gitignored** (this repo ignores `.env*`).
- [ ] No production secrets committed to Git.
- [ ] `ADMIN_EMAILS` is only trusted staff; review who can hit admin APIs.
- [ ] Optional: rate limiting / WAF on your host for `/api/*` (platform-dependent).

---

## 8. Legal and content (Germany / EU)

- [ ] Replace any **placeholder** text in Privacy, Terms, Cookies, and imprint-style pages with your lawyer-reviewed content (entity name, address, DPO if applicable, supervisory authority, etc.).
- [ ] Cookie banner and consent flows match what you actually use.

---

## 9. Smoke tests (production URL)

Run these **on the live domain** after deploy:

- [ ] Home, navigation, legal pages load over **HTTPS**.
- [ ] **Sign up / sign in / sign out**; session persists.
- [ ] **Gated routes**: `/products`, product detail, download only when logged in as expected.
- [ ] **Contact form** delivers to `CONTACT_TO_EMAIL`.
- [ ] **Newsletter consent** on account + admin consent table (if used).
- [ ] **Release email** (if you use it): branding, links, **unsubscribe** link works.
- [ ] **Account delete** (if offered): works and redirects as expected.

---

## 10. Post-launch (optional but good practice)

- [ ] Monitor Vercel/host **build logs** and **function logs** for errors.
- [ ] Add **error monitoring** (e.g. Sentry) when you want deeper visibility.
- [ ] Periodic **backups** of Sanity content and a plan for Clerk user support.

---

## Quick reference — your stack

- **Domain registrar / DNS:** Hostinger (`thomas-reinhardt.com`)
- **App:** Next.js 16 (`site/` folder) — typically **Vercel** + Git
- **Auth:** Clerk  
- **CMS:** Sanity  
- **Transactional email:** Resend (DNS records added in Hostinger)

If you tell me whether you’re deploying on **Vercel** or **Hostinger Node hosting**, this checklist can be narrowed to exact DNS record names and one canonical URL (`www` vs apex) only.
