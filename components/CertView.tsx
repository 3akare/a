"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { Tier } from "@/lib/tiers";
import { Celebrate } from "./Celebrate";
import { CountUp } from "./CountUp";
import { jelly, pop, reveal } from "./motion";
import { ShareButtons } from "./ShareButtons";

type Props = {
  mood: "rich" | "broke";
  tier: Tier;
  kicker: string;
  headline: string;
  amount: number;
  currency: string;
  serial: string;
  sharePath: string;
  cardUrl: string;
  shareText: string;
  note?: string;
  rank?: React.ReactNode;
};

export function CertView(p: Props) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 md:py-16">
      <Celebrate mood={p.mood} />

      <motion.div
        className="relative flex flex-col gap-5 rounded-[2rem] border-[3px] border-ink bg-surface p-6 pt-12 shadow-hard-xl md:p-10 md:pt-14"
        initial={{ y: 60, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={reveal}
      >
        <motion.span
          className="sticker absolute -top-6 right-4 text-lg md:-right-4 md:text-xl"
          style={{ background: p.tier.color, ["--tilt" as string]: "8deg" }}
          initial={{ scale: 3, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ ...jelly, delay: 1.2 }}
        >
          {p.tier.sticker}
        </motion.span>

        <p className="font-mono text-xs tracking-widest uppercase opacity-70">
          Cert № {p.serial} · Ottawa 2026 · Dept. of Vibes
        </p>

        <div className="flex flex-col gap-1">
          <p className="font-display text-2xl font-extrabold md:text-3xl">{p.kicker}</p>
          <h1 className="font-number text-5xl leading-[0.95] tracking-tight break-words md:text-7xl">
            {p.tier.title}
          </h1>
        </div>

        <p className="text-xl font-medium md:text-2xl">{p.headline}</p>

        <div className="flex flex-wrap items-center gap-5">
          <div
            className="max-w-full rounded-2xl border-[3px] border-ink px-4 py-2 text-[#111] shadow-hard"
            style={{ background: p.tier.color }}
          >
            <CountUp to={p.amount} currency={p.currency} className="font-number text-[clamp(1.5rem,8vw,3.75rem)]" />
          </div>
          <motion.div
            className="seal w-28 text-5xl md:w-32"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: -8 }}
            transition={{ ...jelly, delay: 1.6 }}
            aria-hidden
          >
            {p.tier.emoji}
          </motion.div>
        </div>

        <p className="text-lg opacity-80">{p.tier.line}</p>
        {p.note && <p className="pill self-start">{p.note}</p>}
      </motion.div>

      {p.rank}

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...pop, delay: 2 }}>
        <ShareButtons path={p.sharePath} card={p.cardUrl} text={p.shareText} />
      </motion.div>

      <motion.figure
        className="flex flex-col gap-3"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...pop, delay: 2.2 }}
      >
        <figcaption className="font-display text-xl font-bold">Your share card 👇</figcaption>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.cardUrl}
          alt="Your certificate as a share image"
          width={1200}
          height={630}
          className="h-auto w-full rounded-[1.5rem] border-[3px] border-ink shadow-hard-lg"
        />
      </motion.figure>

      <Link href="/" className="btn-chunky btn-surface self-start">
        ← Check something else
      </Link>
    </section>
  );
}
