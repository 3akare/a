"use server";

import { headers } from "next/headers";
import { MAX_AMOUNT, MAX_DREAM, cleanInput, demoId, formatMoney } from "@/lib/cert";
import { addBrokie, getBrokie } from "@/lib/brokies";
import { getStripe } from "@/lib/stripe";

export type CheckoutResult = { url: string } | { error: string };

async function baseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createCheckout(form: FormData): Promise<CheckoutResult> {
  const res = cleanInput(Object.fromEntries(form));
  if (!res.ok) return { error: res.error };
  const { name, item, amount, currency } = res.value;

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!stripe) return { url: `/certified/${demoId(res.value)}` };

  const base = await baseUrl();
  const broke = new URLSearchParams({ name, item, amount: String(amount), currency });
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: `Proof you can afford: ${item}`,
              description: `If ${name} can pay ${formatMoney(amount, currency)} here, ${name} can buy it twice. Test mode — no real money.`,
            },
          },
        },
      ],
      metadata: { name, item },
      success_url: `${base}/certified/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/broke?${broke}`,
    });
    if (!session.url) return { error: "Stripe didn't give us a checkout link. Try again." };
    return { url: session.url };
  } catch (e) {
    console.error(e);
    return { error: "Our bank is napping. Try again in a sec." };
  }
}

export async function joinBrokies(input: { name: string; item: string; amount: number; currency: string }) {
  const res = cleanInput({ ...input, price: input.amount / 100 }, MAX_DREAM);
  if (!res.ok) return null;
  try {
    return await addBrokie(res.value);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export type EraseResult = { url: string } | { error: string; stuck?: boolean };

/** Pay exactly what they couldn't afford to get their name off the board. */
export async function eraseCheckout(id: string): Promise<EraseResult> {
  const b = await getBrokie(String(id));
  if (!b) return { error: "Already gone. Someone paid. Rich behaviour." };
  if (b.amount > MAX_AMOUNT) return { error: "Too broke to leave. Even our bank can't charge that much. You live here now 🔒", stuck: true };

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return { error: (e as Error).message };
  }
  if (!stripe) return { url: `/brokies/erased?demo=${b.id}` };

  const base = await baseUrl();
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: b.currency,
            unit_amount: b.amount,
            product_data: {
              name: `Erase ${b.name} from the Hall of Brokies`,
              description: `Costs exactly what they couldn't afford (${b.item}). Test mode — no real money.`,
            },
          },
        },
      ],
      metadata: { kind: "erase", brokieId: b.id },
      success_url: `${base}/brokies/erased?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/brokies`,
    });
    return session.url ? { url: session.url } : { error: "Stripe didn't give us a link. Try again." };
  } catch (e) {
    console.error(e);
    return { error: "Our bank is napping. Try again in a sec." };
  }
}
