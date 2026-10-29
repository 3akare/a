import { getCert, richCardData } from "@/lib/cert";
import { OG, renderCard } from "@/lib/card";
import { BROKE, tierFor } from "@/lib/tiers";

export const alt = "A very official How Rich Are You? certificate";
export const size = OG;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = await getCert(id);
  if (!cert?.paid) {
    return renderCard({ kicker: "PENDING", headline: "Wealth not yet verified.", amount: "$???", serial: "000000", date: "OTTAWA 2026", tier: BROKE });
  }
  return renderCard({ ...richCardData(cert), tier: tierFor(cert.amount) });
}
