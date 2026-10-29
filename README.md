# How Rich Are You? 💸

> If you can't buy it twice, you can't afford it.

Tell us the thing you want and its price. Pay us that exact amount. If you survive, you're
**certified rich** and get a share card for your socials. Built for Stupid Ideas Ottawa (Nov 7–8).

**No real money moves.** Stripe runs in test mode only — the app refuses live keys.

## Run it

```bash
npm install
npm run dev
```

- **No Stripe key** → demo mode. Submitting skips Stripe and goes straight to the certificate.
- **With Stripe** → copy `.env.example` to `.env.local` and add a `sk_test_...` key.
  Pay with `4242 4242 4242 4242`, any future date, any CVC. Hit "back" on Stripe to land on the
  "Rich in Spirit" page.

## Pages

- `/` — form + fake "wealth audit"
- `/certified/[id]` — certificate, count-up, confetti, share buttons
- `/broke` — the losing (still shareable) certificate
- `/api/card/[id]` — share image (`?size=story` for 1080×1350); `[id]` = `broke` for the losing card

## Deploy

Push to Vercel. Set `STRIPE_SECRET_KEY` (test key) and `NEXT_PUBLIC_BASE_URL`.

UI follows the `bubbly-hype-ui` skill (neo-brutalist, Tailwind v4 + motion + canvas-confetti).
