export type Tier = {
  title: string;
  sticker: string;
  emoji: string;
  line: string;
  color: string;
};

// Amount is in cents. Currencies are treated the same on purpose — it's a joke app.
const TIERS: { min: number; tier: Tier }[] = [
  { min: 2_000_000, tier: { title: "Suspiciously Rich", sticker: "TOP 0.01%", emoji: "🛥️", line: "Please explain your income to no one.", color: "#C6FF3D" } },
  { min: 200_000, tier: { title: "Very Rich", sticker: "YACHT ADJACENT", emoji: "💎", line: "Your wallet said yes. Loudly.", color: "#FFD23F" } },
  { min: 20_000, tier: { title: "Certified Rich", sticker: "BALLER", emoji: "💰", line: "You could buy it twice. Show-off.", color: "#3DDC97" } },
  { min: 2_000, tier: { title: "Comfortably Rich", sticker: "COMFY", emoji: "🛋️", line: "Treat yourself. Twice, apparently.", color: "#5B8CFF" } },
  { min: 0, tier: { title: "Snack-Money Rich", sticker: "SNACK BARON", emoji: "🍟", line: "Small flex. Still a flex.", color: "#FF7A1A" } },
];

export function tierFor(amount: number): Tier {
  return TIERS.find((t) => amount >= t.min)!.tier;
}

export const BROKE: Tier = {
  title: "Rich in Spirit",
  sticker: "NOT TODAY",
  emoji: "✨",
  line: "Your bank said 'lol'. We still love you.",
  color: "#FF5C5C",
};
