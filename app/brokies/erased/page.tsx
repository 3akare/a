import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Celebrate } from "@/components/Celebrate";
import { Marquee } from "@/components/Marquee";
import { getBrokie, removeBrokie } from "@/lib/brokies";
import { formatMoney } from "@/lib/money";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Erased 🧽 · Hall of Brokies" };

export default function Page({ searchParams }: PageProps<"/brokies/erased">) {
  return (
    <main className="mesh grain min-h-dvh overflow-x-clip">
      <Marquee items={["ERASED", "LIKE IT NEVER HAPPENED", "MONEY WELL WASTED", "WAIT… YOU COULD AFFORD IT?"]} />
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 md:py-20">
        <Suspense fallback={<p className="card-blob font-display text-2xl font-extrabold">Scrubbing the records… 🧽</p>}>
          <Erased searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function brokieIdFrom(sp: Record<string, string | string[] | undefined>) {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]);
  const stripe = getStripe();
  const sessionId = one("session_id");
  if (stripe && sessionId?.startsWith("cs_test_")) {
    try {
      const s = await stripe.checkout.sessions.retrieve(sessionId);
      return s.payment_status === "paid" && s.metadata?.kind === "erase" ? (s.metadata.brokieId ?? null) : null;
    } catch {
      return null;
    }
  }
  // Demo mode only: no Stripe, so no payment to check.
  return !stripe ? (one("demo") ?? null) : null;
}

async function Erased({ searchParams }: { searchParams: PageProps<"/brokies/erased">["searchParams"] }) {
  await connection();
  const id = await brokieIdFrom(await searchParams);
  const b = id ? await getBrokie(id) : null;

  if (!b) {
    return (
      <div className="card-blob flex flex-col gap-4">
        <p className="text-6xl">🤷</p>
        <h1 className="font-display text-4xl font-extrabold">Nothing to erase.</h1>
        <p className="text-lg opacity-80">Either they&apos;re already gone, or nobody paid. Brokies are forever until someone pays.</p>
        <Link href="/brokies" className="btn-chunky self-start">
          Back to the board
        </Link>
      </div>
    );
  }

  await removeBrokie(b.id);
  const price = formatMoney(b.amount, b.currency);
  return (
    <>
      <Celebrate />
      <span className="sticker self-start" style={{ ["--tilt" as string]: "-6deg" }}>
        RECORDS SCRUBBED 🧽
      </span>
      <h1 className="font-display text-5xl leading-[0.9] font-extrabold tracking-tight break-words md:text-7xl">
        {b.name} has been <span className="highlight">erased</span>.
      </h1>
      <div className="card-blob flex flex-col gap-4">
        <p className="text-xl">
          Someone paid <b className="font-number">{price}</b> — the exact price of {b.item} — to make this brokie disappear.
        </p>
        <p className="receipt">
          RECEIPT · NAME REMOVAL
          <br />
          {b.item.toUpperCase()} ........ NOT INCLUDED
          <br />
          DIGNITY ............... RESTORED
          <br />
          TOTAL ................. {price}
        </p>
        <p className="text-lg font-bold">
          Wait. If you could pay {price}… you could afford {b.item}. 🤔
        </p>
        <p className="opacity-80">You weren&apos;t broke. You were just bad at decisions.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link href="/brokies" className="btn-chunky">
          Back to the board
        </Link>
        <Link href="/" className="btn-chunky btn-surface">
          Get certified rich instead
        </Link>
      </div>
    </>
  );
}
