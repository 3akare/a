"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

const COLORS = ["#FFD23F", "#3DDC97", "#FF4DA6", "#5B8CFF"];

export function Celebrate({ mood = "rich" }: { mood?: "rich" | "broke" }) {
  useEffect(() => {
    const t1 = setTimeout(() => {
      if (mood === "broke") {
        const scalar = 2.4;
        const shapes = ["🥲", "🪙", "✨"].map((text) => confetti.shapeFromText({ text, scalar }));
        confetti({ shapes, scalar, particleCount: 24, spread: 100, startVelocity: 20, gravity: 1.2, origin: { y: 0.2 }, disableForReducedMotion: true });
        return;
      }
      const o = { particleCount: 90, spread: 60, startVelocity: 55, colors: COLORS, disableForReducedMotion: true };
      confetti({ ...o, angle: 60, origin: { x: 0, y: 0.75 } });
      confetti({ ...o, angle: 120, origin: { x: 1, y: 0.75 } });
    }, 1700);
    const t2 = setTimeout(() => {
      if (mood === "broke") return;
      const scalar = 2.2;
      const shapes = ["💸", "💎", "🪙"].map((text) => confetti.shapeFromText({ text, scalar }));
      confetti({ shapes, scalar, particleCount: 36, spread: 140, startVelocity: 30, gravity: 0.8, ticks: 260, origin: { y: 0.25 }, disableForReducedMotion: true });
    }, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mood]);
  return null;
}
