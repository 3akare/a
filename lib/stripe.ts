import Stripe from "stripe";

let client: Stripe | null = null;

/** Stripe client, or null when no key is set (the app then runs in demo mode). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!key.startsWith("sk_test_") && !key.startsWith("rk_test_")) {
    throw new Error("Test keys only. This app must never take real money.");
  }
  client ??= new Stripe(key);
  return client;
}
