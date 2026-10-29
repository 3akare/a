import Link from "next/link";
import { CheckForm } from "@/components/CheckForm";
import { Marquee } from "@/components/Marquee";

export default function Home() {
  const demo = !process.env.STRIPE_SECRET_KEY;
  return (
    <main className="mesh grain min-h-dvh overflow-x-clip">
      <Marquee />
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 md:py-20">
        <span className="sticker self-start" style={{ ["--tilt" as string]: "-6deg" }}>
          EST. 2026 · OTTAWA
        </span>

        <h1 className="font-display text-6xl leading-[0.9] font-extrabold tracking-tight md:text-8xl">
          How <span className="highlight">rich</span> are you?
        </h1>

        <p className="max-w-xl text-lg md:text-xl">
          They say <b>if you can&apos;t buy it twice, you can&apos;t afford it.</b> So pay us the price once. If
          you&apos;re still standing, congrats — you&apos;re certified rich.
        </p>

        <CheckForm demo={demo} />

        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["1", "Tell us the thing", "Shoes, a yacht, a really nice sandwich."],
            ["2", "Pay its price to us", "The exact amount. That's the test."],
            ["3", "Get certified", "A badge so official it's basically legal."],
          ].map(([n, t, d]) => (
            <li key={n} className="flex gap-3 rounded-[1.5rem] border-[3px] border-ink bg-surface p-4 shadow-hard">
              <span className="font-number grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-accent text-[#111]">
                {n}
              </span>
              <span>
                <b className="font-display block text-lg">{t}</b>
                <span className="text-sm opacity-80">{d}</span>
              </span>
            </li>
          ))}
        </ol>

        <Link
          href="/brokies"
          className="group flex items-center justify-between gap-4 rounded-[2rem] border-[3px] border-ink bg-ink p-5 text-bg shadow-hard-lg transition-transform hover:-rotate-1"
        >
          <span>
            <b className="font-display block text-2xl md:text-3xl">🥲 Hall of Brokies</b>
            <span className="opacity-80">Everyone who couldn&apos;t afford it, ranked. Live.</span>
          </span>
          <span className="sticker shrink-0" style={{ background: "var(--pop-red)" }}>
            SEE →
          </span>
        </Link>

        <p className="font-mono text-xs tracking-widest uppercase opacity-70">
          *Not financial advice. Not financial anything. Test mode only — no real money moves.
        </p>
      </section>
    </main>
  );
}
