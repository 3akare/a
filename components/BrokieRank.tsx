"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { joinBrokies } from "@/app/actions";
import { formatMoney } from "@/lib/money";
import { EraseButton } from "./EraseButton";
import { jelly } from "./motion";

type Input = { name: string; item: string; amount: number; currency: string };

export function BrokieRank({ input }: { input: Input }) {
  const [res, setRes] = useState<{ id: string; rank: number; total: number } | null>(null);
  const { name, item, amount, currency } = input;

  useEffect(() => {
    let live = true;
    joinBrokies({ name, item, amount, currency }).then((r) => live && setRes(r));
    return () => {
      live = false;
    };
  }, [name, item, amount, currency]);

  if (!res) return null;
  return (
    <motion.div
      initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
      animate={{ scale: 1, rotate: -2, opacity: 1 }}
      transition={{ ...jelly, delay: 0.8 }}
      className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border-[3px] border-ink bg-ink p-5 text-bg shadow-hard-lg"
    >
      <p className="font-display text-2xl font-extrabold leading-tight md:text-3xl">
        {res.rank === 1 ? "👑 You're the BROKEST" : `🏆 You're #${res.rank} brokest`}
        <span className="block font-body text-base font-medium opacity-80">
          out of {res.total} {res.total === 1 ? "brokie" : "brokies"} in the Hall of Brokies
        </span>
      </p>
      <span className="flex flex-col items-start gap-3">
        <Link href="/brokies" className="btn-chunky btn-surface">
          See the board →
        </Link>
        <EraseButton id={res.id} price={formatMoney(amount, currency)} big />
      </span>
    </motion.div>
  );
}
