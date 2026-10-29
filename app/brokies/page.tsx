import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { EraseButton } from "@/components/EraseButton";
import { Marquee } from "@/components/Marquee";
import { type Brokie, topBrokies } from "@/lib/brokies";
import { formatMoney } from "@/lib/cert";

export const metadata: Metadata = {
  title: "Hall of Brokies 🥲",
  description: "Ranked by how much they couldn't afford. How rich are you?",
};

export default function Page() {
  return (
    <main className="mesh grain min-h-dvh overflow-x-clip">
      <Marquee items={["HALL OF BROKIES", "RANKED BY WHAT THEY COULDN'T AFFORD", "THE BANK SAID LOL", "WE STILL LOVE YOU"]} />
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:py-16">
        <span className="sticker self-start" style={{ background: "var(--pop-red)", ["--tilt" as string]: "-6deg" }}>
          LIVE · OTTAWA 2026
        </span>
        <h1 className="font-display text-6xl leading-[0.9] font-extrabold tracking-tight md:text-8xl">
          Hall of <span className="highlight">Brokies</span>
        </h1>
        <p className="max-w-xl text-lg md:text-xl">
          Ranked by how much they <b>couldn&apos;t</b> afford. The bigger the dream, the higher you go. Want
          someone gone? Pay exactly what they couldn&apos;t afford. 🧽
        </p>
        <Suspense fallback={<p className="card-blob font-display text-2xl font-extrabold">Counting the brokies… 🧮</p>}>
          <Board />
        </Suspense>
        <div className="flex flex-wrap gap-4">
          <Link href="/" className="btn-chunky">
            Try your luck 💸
          </Link>
        </div>
      </section>
    </main>
  );
}

async function Board() {
  await connection();
  const { list, total, sum } = await topBrokies();
  if (!list.length) {
    return (
      <div className="card-blob flex flex-col gap-2 text-center">
        <p className="text-6xl">🦗</p>
        <p className="font-display text-2xl font-extrabold">No brokies yet.</p>
        <p className="opacity-80">Suspicious. Be the first legend.</p>
        <AutoRefresh />
      </div>
    );
  }

  const [first, second, third] = list;
  return (
    <>
      <AutoRefresh />
      <div className="flex flex-wrap gap-3">
        <span className="pill">
          {total} {total === 1 ? "brokie" : "brokies"}
        </span>
        <span className="pill" style={{ background: "var(--pop-green)" }}>
          {formatMoney(sum, "cad")} of stuff nobody could afford
        </span>
      </div>

      {/* Podium: 2nd, 1st, 3rd */}
      <div className="grid grid-cols-3 items-end gap-2 md:gap-4">
        <Podium b={second} place={2} />
        <Podium b={first} place={1} />
        <Podium b={third} place={3} />
      </div>

      {list.length > 3 && (
        <ol className="flex flex-col gap-3">
          {list.slice(3).map((b, i) => (
            <li
              key={b.id}
              className="flex items-start gap-3 rounded-[1.5rem] border-[3px] border-ink bg-surface p-3 shadow-hard md:p-4"
            >
              <span className="font-number grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-accent text-[#111]">
                {i + 4}
              </span>
              <span className="min-w-0 flex-1">
                <b className="font-display block truncate text-lg">{b.name}</b>
                <span className="block truncate text-sm opacity-80">couldn&apos;t afford {b.item}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-number text-lg md:text-2xl">{formatMoney(b.amount, b.currency)}</span>
                <EraseButton id={b.id} price={formatMoney(b.amount, b.currency)} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

const PODIUM = {
  1: { h: "h-44 md:h-56", bg: "var(--pop-red)", medal: "👑", label: "BROKEST" },
  2: { h: "h-32 md:h-40", bg: "var(--pop-orange)", medal: "🥈", label: "2ND" },
  3: { h: "h-24 md:h-32", bg: "var(--pop-blue)", medal: "🥉", label: "3RD" },
} as const;

function Podium({ b, place }: { b?: Brokie; place: 1 | 2 | 3 }) {
  const p = PODIUM[place];
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      {b ? (
        <>
          <span className="text-4xl md:text-5xl">{p.medal}</span>
          <b className="font-display w-full truncate text-base md:text-xl">{b.name}</b>
          <span className="line-clamp-2 w-full text-xs opacity-80 md:text-sm">{b.item}</span>
        </>
      ) : (
        <span className="text-sm opacity-60">your name here?</span>
      )}
      <div
        className={`${p.h} flex w-full flex-col items-center justify-start gap-1 rounded-t-[1.5rem] border-[3px] border-ink p-2 pt-3 text-[#111] shadow-hard`}
        style={{ background: p.bg }}
      >
        <span className="font-number text-2xl md:text-4xl">{place}</span>
        {b && <span className="font-number text-[clamp(0.7rem,3vw,1.25rem)] break-all">{formatMoney(b.amount, b.currency)}</span>}
        <span className="font-mono text-[10px] tracking-widest md:text-xs">{p.label}</span>
      </div>
      {b && <EraseButton id={b.id} price="it" />}
    </div>
  );
}
