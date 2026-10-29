const DEFAULT = [
  "JEFF CAN AFFORD A YACHT · TWICE",
  "PRIYA BOUGHT A PS5 · TWICE",
  "NOT FINANCIAL ADVICE",
  "TOMI CAN AFFORD SHAWARMA · TWICE",
  "VERIFIED BY ABSOLUTELY NO ONE",
  "OTTAWA'S RICHEST HACKATHON",
];

export function Marquee({ items = DEFAULT }: { items?: string[] }) {
  const row = items.map((t, i) => <span key={i}>{t} ✦</span>);
  return (
    <div className="marquee relative z-10" aria-hidden>
      <div>
        {row}
        {row}
      </div>
    </div>
  );
}
