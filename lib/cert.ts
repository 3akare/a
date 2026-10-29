import { formatMoney } from "./money";
import { getStripe } from "./stripe";

export { formatMoney };

export const CURRENCIES = ["cad", "usd", "eur", "gbp", "ngn"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type Cert = {
  id: string;
  name: string;
  item: string;
  /** smallest currency unit (cents) */
  amount: number;
  currency: Currency;
  paid: boolean;
  demo: boolean;
};

export type CertInput = Pick<Cert, "name" | "item" | "amount" | "currency">;

/** Max Stripe allows for one line item, in cents. */
export const MAX_AMOUNT = 99_999_999;
export const MIN_AMOUNT = 100;

/** Dreams have no limit when you are not paying. */
export const MAX_DREAM = 100_000_000_000_000;

export function cleanInput(
  raw: { name?: unknown; item?: unknown; price?: unknown; currency?: unknown },
  max = MAX_AMOUNT,
):
  | { ok: true; value: CertInput }
  | { ok: false; error: string } {
  const name = String(raw.name ?? "").trim().slice(0, 40);
  const item = String(raw.item ?? "").trim().slice(0, 60);
  const currency = String(raw.currency ?? "cad").toLowerCase() as Currency;
  const price = Number(String(raw.price ?? "").replace(/[^0-9.]/g, ""));
  if (!name) return { ok: false, error: "We need a name for the certificate." };
  if (!item) return { ok: false, error: "What are you buying? Be honest." };
  if (!CURRENCIES.includes(currency)) return { ok: false, error: "That's not a currency we recognise." };
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "That's not a number. Nice try." };
  const amount = Math.round(price * 100);
  if (amount < MIN_AMOUNT) return { ok: false, error: "Under $1? You can afford that. Promise." };
  if (amount > max) return { ok: false, error: "Over $999,999.99? Our bank got scared. Pick something cheaper." };
  return { ok: true, value: { name, item, amount, currency } };
}

/* Demo mode: no Stripe key, so the cert data rides in the id itself. */
export function demoId(input: CertInput) {
  return "demo_" + Buffer.from(JSON.stringify(input)).toString("base64url");
}

function fromDemoId(id: string): Cert | null {
  try {
    const raw = JSON.parse(Buffer.from(id.slice(5), "base64url").toString());
    const res = cleanInput({ ...raw, price: raw.amount / 100 });
    return res.ok ? { ...res.value, id, paid: true, demo: true } : null;
  } catch {
    return null;
  }
}

export async function getCert(id: string): Promise<Cert | null> {
  if (id.startsWith("demo_")) return fromDemoId(id);
  const stripe = getStripe();
  if (!stripe || !id.startsWith("cs_test_")) return null;
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    const m = s.metadata ?? {};
    if (m.kind === "erase") return null;
    return {
      id,
      name: m.name ?? "Anonymous Legend",
      item: m.item ?? "something fancy",
      amount: s.amount_total ?? 0,
      currency: (s.currency ?? "cad") as Currency,
      paid: s.payment_status === "paid",
      demo: false,
    };
  } catch {
    return null;
  }
}


/** Stable fake serial number from the id. */
export function serial(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return String(Math.abs(h) % 1_000_000).padStart(6, "0");
}

export function richCardData(c: Cert) {
  return {
    kicker: "OFFICIALLY",
    headline: `${c.name} can afford ${c.item}. Twice.`,
    amount: formatMoney(c.amount, c.currency),
    serial: serial(c.id),
    date: "OTTAWA 2026",
  };
}

export function brokeCardData(c: CertInput) {
  return {
    kicker: "CERTIFIED",
    headline: `${c.name} wanted ${c.item}. The bank said lol.`,
    amount: formatMoney(c.amount, c.currency),
    serial: serial(`${c.name}|${c.item}|${c.amount}`),
    date: "OTTAWA 2026",
  };
}

export function parseBroke(sp: Record<string, string | string[] | undefined>) {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]);
  const amount = Number(one("amount"));
  const res = cleanInput(
    { name: one("name") || "Someone", item: one("item") || "something nice", price: amount / 100 || 1, currency: one("currency") },
    MAX_DREAM,
  );
  return res.ok ? res.value : { name: "Someone", item: "something nice", amount: 100, currency: "cad" as Currency };
}
