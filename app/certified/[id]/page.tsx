import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CertView } from "@/components/CertView";
import { Marquee } from "@/components/Marquee";
import { getCert, richCardData } from "@/lib/cert";
import { tierFor } from "@/lib/tiers";

export async function generateMetadata({ params }: PageProps<"/certified/[id]">): Promise<Metadata> {
  const cert = await getCert((await params).id);
  if (!cert?.paid) return { title: "How Rich Are You?" };
  const t = tierFor(cert.amount);
  return {
    title: `${cert.name} is ${t.title} ${t.emoji}`,
    description: `${cert.name} can afford ${cert.item}. Twice. How rich are you?`,
  };
}

export default function Page({ params }: PageProps<"/certified/[id]">) {
  return (
    <main className="mesh grain min-h-dvh overflow-x-clip">
      <Marquee items={["WEALTH VERIFIED", "TWICE", "CERTIFIED", "DEPT. OF VIBES", "NOT FINANCIAL ADVICE"]} />
      <Suspense fallback={<Loading />}>
        <Certificate params={params} />
      </Suspense>
    </main>
  );
}

async function Certificate({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await getCert(id);
  if (!cert) redirect("/");
  if (!cert.paid) redirect("/broke");

  const tier = tierFor(cert.amount);
  const card = richCardData(cert);
  return (
    <CertView
      mood="rich"
      tier={tier}
      kicker={card.kicker}
      headline={card.headline}
      amount={cert.amount}
      currency={cert.currency}
      serial={card.serial}
      sharePath={`/certified/${id}`}
      cardUrl={`/api/card/${id}`}
      shareText={`I'm officially ${tier.title} ${tier.emoji} I can afford ${cert.item}. Twice. How rich are you?`}
      note={cert.demo ? "demo mode · nobody was charged" : "stripe test mode · no real money moved"}
    />
  );
}

function Loading() {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-4">
      <p className="card-blob font-display text-2xl font-extrabold">Printing your certificate… 🖨️</p>
    </div>
  );
}
