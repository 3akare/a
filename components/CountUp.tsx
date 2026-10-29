"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function CountUp({ to, currency, className }: { to: number; currency: string; className?: string }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  const [done, setDone] = useState(!!reduce);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, to, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: setV, onComplete: () => setDone(true) });
    return () => c.stop();
  }, [to, reduce]);
  const text = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(Math.round(v) / 100);
  return (
    <motion.span
      className={`inline-block tabular-nums ${className ?? ""}`}
      animate={done && !reduce ? { scale: [1, 1.15, 1] } : {}}
      transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}
