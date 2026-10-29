"use client";

import { motion } from "motion/react";
import { useState, useSyncExternalStore } from "react";
import { jelly } from "./motion";

const noop = () => () => {};

export function ShareButtons({ path, card, text }: { path: string; card: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const url = origin + path;
  const enc = encodeURIComponent;
  const story = `${card}${card.includes("?") ? "&" : "?"}size=story`;

  async function share() {
    try {
      const blob = await (await fetch(story)).blob();
      const file = new File([blob], "how-rich-are-you.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text, url });
      if (navigator.share) return await navigator.share({ text, url });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
    await copy();
  }

  async function copy() {
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const links = [
    { label: "𝕏", href: `https://x.com/intent/post?text=${enc(text)}&url=${enc(url)}` },
    { label: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <motion.button onClick={share} className="btn-chunky w-full text-xl" whileTap={{ scaleX: 1.04, scaleY: 0.92 }} transition={jelly}>
        FLEX IT 📣
      </motion.button>
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-chunky btn-surface min-h-11 px-4 py-2 text-base">
            {l.label}
          </a>
        ))}
        <a href={story} download="how-rich-are-you.png" className="btn-chunky btn-accent min-h-11 px-4 py-2 text-base">
          Save PNG
        </a>
        <button onClick={copy} className="btn-chunky btn-ink min-h-11 px-4 py-2 text-base">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
