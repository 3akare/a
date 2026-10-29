"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { eraseCheckout } from "@/app/actions";
import { jelly } from "./motion";

export function EraseButton({ id, price, big = false }: { id: string; price: string; big?: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const [pending, start] = useTransition();

  function go() {
    setMsg(null);
    start(async () => {
      const res = await eraseCheckout(id);
      if ("url" in res) return window.location.assign(res.url);
      setStuck(!!res.stuck);
      setMsg(res.error);
    });
  }

  return (
    <span className="flex flex-col items-start gap-2">
      <motion.button
        type="button"
        onClick={go}
        disabled={pending || stuck}
        className={`btn-chunky ${stuck ? "btn-ink" : "btn-accent"} ${big ? "" : "min-h-9 rounded-xl px-3 py-1 text-sm"}`}
        animate={stuck ? { x: [0, -6, 6, -3, 0] } : {}}
        transition={{ type: "tween", duration: 0.4 }}
        whileTap={{ scaleX: 1.06, scaleY: 0.92 }}
      >
        {stuck ? "🔒 Stuck forever" : pending ? "Opening wallet…" : `🧽 Erase for ${price}`}
      </motion.button>
      <AnimatePresence>
        {msg && (
          <motion.span
            role="alert"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={jelly}
            className="max-w-xs rounded-xl border-2 border-ink bg-pop-red px-3 py-1 text-xs font-bold text-[#111]"
          >
            {msg}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
