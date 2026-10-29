"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createCheckout } from "@/app/actions";
import { jelly, pop } from "./motion";

const CURRENCIES = [
  { code: "cad", label: "CA$" },
  { code: "usd", label: "US$" },
  { code: "eur", label: "€" },
  { code: "gbp", label: "£" },
  { code: "ngn", label: "₦" },
];

const AUDIT_LINES = [
  "Counting your yachts…",
  "Calling your accountant (Kevin)…",
  "Checking under the couch cushions…",
  "Polishing the gold…",
  "Consulting the economy…",
  "Asking your mom…",
];

const AUDIT_MS = 2800;

export function CheckForm({ demo }: { demo: boolean }) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("cad");
  const [error, setError] = useState<string | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function giveUp(e: React.MouseEvent<HTMLButtonElement>) {
    const f = e.currentTarget.form!;
    if (!f.reportValidity()) return;
    const d = new FormData(f);
    const amount = Math.round(Number(String(d.get("price")).replace(/[^0-9.]/g, "")) * 100);
    if (!(amount > 0)) return setError("That's not a number. Nice try.");
    const q = new URLSearchParams({
      name: String(d.get("name")),
      item: String(d.get("item")),
      amount: String(amount),
      currency: String(d.get("currency")),
    });
    router.push(`/broke?${q}`);
  }

  const symbol = CURRENCIES.find((c) => c.code === currency)!.label;
  const num = Number(price.replace(/[^0-9.]/g, ""));
  const pretty = num > 0 ? `${symbol}${num.toLocaleString("en-CA", { maximumFractionDigits: 2 })}` : null;

  function submit(form: FormData) {
    setError(null);
    setAuditing(true);
    startTransition(async () => {
      const [res] = await Promise.all([createCheckout(form), new Promise((r) => setTimeout(r, AUDIT_MS))]);
      if ("error" in res) {
        setAuditing(false);
        setError(res.error);
        return;
      }
      window.location.assign(res.url);
    });
  }

  return (
    <>
      <motion.form
        action={submit}
        className="card-blob relative flex flex-col gap-5 pt-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...pop, delay: 0.15 }}
      >
        <motion.span
          className="sticker absolute -top-5 -right-3"
          style={{ ["--tilt" as string]: "8deg" }}
          initial={{ scale: 0, rotate: 40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...jelly, delay: 0.5 }}
        >
          OFFICIAL-ISH 💎
        </motion.span>

        <Field label="Your name" hint="for the certificate">
          <input name="name" required maxLength={40} autoComplete="given-name" className="input-chunky" placeholder="Jeff B." />
        </Field>

        <Field label="What do you want to buy?">
          <input
            name="item"
            required
            maxLength={60}
            className="input-chunky"
            placeholder="A yacht. Obviously."
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </Field>

        <Field label="How much is it?">
          <div className="flex gap-3">
            <select
              name="currency"
              aria-label="Currency"
              className="input-chunky w-24! shrink-0 cursor-pointer"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              name="price"
              required
              inputMode="decimal"
              className="input-chunky font-mono"
              placeholder="4,999"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </Field>

        <AnimatePresence mode="popLayout">
          {pretty && (
            <motion.p
              key="tease"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={jelly}
              className="receipt"
            >
              To prove it, pay us exactly <b className="text-base">{pretty}</b>
              {" "}right now. If you can, you could buy {item ? <b>{item}</b> : "it"} twice.
              <br />
              <span className="opacity-60">Still standing after that? Then you can afford it.</span>
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: [0, -8, 8, -4, 0], opacity: 1 }}
              transition={{ type: "tween", duration: 0.4 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border-[3px] border-ink bg-pop-red px-4 py-3 font-bold text-[#111]"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <motion.button
            type="submit"
            className="btn-chunky text-xl"
            whileTap={{ scaleX: 1.06, scaleY: 0.92 }}
            transition={jelly}
            disabled={auditing}
          >
            PROVE IT 💸
          </motion.button>
          <motion.button
            type="button"
            onClick={giveUp}
            className="btn-chunky btn-surface"
            whileTap={{ scaleX: 1.06, scaleY: 0.92 }}
            transition={jelly}
            disabled={auditing}
          >
            I can&apos;t afford it 🥲
          </motion.button>
          <span className="pill">{demo ? "demo mode · no card needed" : "test mode · card 4242 4242 4242 4242"}</span>
        </div>
      </motion.form>

      <AnimatePresence>{auditing && <Audit />}</AnimatePresence>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-display text-lg font-bold">
        {label} {hint && <span className="font-body text-sm font-medium opacity-60">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

function Audit() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % AUDIT_LINES.length), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div
      className="mesh grain fixed inset-0 z-50 grid place-items-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="card-blob flex w-full max-w-md flex-col items-center gap-6 text-center"
        initial={{ scale: 0.6, rotate: -6 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={jelly}
      >
        <motion.div
          className="text-7xl"
          animate={{ rotate: [0, -12, 12, 0], y: [0, -10, 0] }}
          transition={{ type: "tween", duration: 0.9, repeat: Infinity }}
          aria-hidden
        >
          🧐
        </motion.div>
        <p className="font-mono text-xs uppercase tracking-widest">Wealth audit in progress</p>
        <div className="h-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              className="font-display text-2xl font-extrabold"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {AUDIT_LINES[i]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="h-6 w-full overflow-hidden rounded-full border-[3px] border-ink bg-surface">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: AUDIT_MS / 1000, ease: [0.3, 0.1, 0.2, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
