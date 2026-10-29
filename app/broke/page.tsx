import { Suspense } from "react";
import type { Metadata } from "next";
import { BrokieRank } from "@/components/BrokieRank";
import { CertView } from "@/components/CertView";
import { Marquee } from "@/components/Marquee";
import { brokeCardData, parseBroke } from "@/lib/cert";
import { BROKE } from "@/lib/tiers";

export async function generateMetadata({ searchParams }: PageProps<"/broke">): Promise<Metadata> {
  const input = parseBroke(await searchParams);
  const q = new URLSearchParams({ name: input.name, item: input.item, amount: String(input.amount), currency: input.currency });
  return {
    title: `${input.name} is Rich in Spirit ✨`,
    description: "The bank said lol. How rich are you?",
    openGraph: { images: [{ url: `/api/card/broke?${q}`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [`/api/card/broke?${q}`] },
  };
}

export default function Page({ searchParams }: PageProps<"/broke">) {
  return (
    <main className="mesh grain min-h-dvh overflow-x-clip">
      <Marquee items={["NOT TODAY", "RICH IN SPIRIT", "THE BANK SAID LOL", "WE STILL LOVE YOU", "TRY A SANDWICH"]} />
      <Suspense>
        <Broke searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Broke({ searchParams }: { searchParams: PageProps<"/broke">["searchParams"] }) {
  const input = parseBroke(await searchParams);
  const card = brokeCardData(input);
  const q = new URLSearchParams({ name: input.name, item: input.item, amount: String(input.amount), currency: input.currency });
  return (
    <CertView
      rank={<BrokieRank input={input} />}
      mood="broke"
      tier={BROKE}
      kicker={card.kicker}
      headline={card.headline}
      amount={input.amount}
      currency={input.currency}
      serial={card.serial}
      sharePath={`/broke?${q}`}
      cardUrl={`/api/card/broke?${q}`}
      shareText={`I'm officially Rich in Spirit ✨ (I can't afford ${input.item}). How rich are you?`}
    />
  );
}
