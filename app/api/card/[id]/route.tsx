import { brokeCardData, getCert, parseBroke, richCardData } from "@/lib/cert";
import { renderCard } from "@/lib/card";
import { BROKE, tierFor } from "@/lib/tiers";

export async function GET(req: Request, ctx: RouteContext<"/api/card/[id]">) {
  const { id } = await ctx.params;
  const sp = new URL(req.url).searchParams;
  const size = sp.get("size") === "story" ? "story" : "og";

  if (id === "broke") {
    const input = parseBroke(Object.fromEntries(sp));
    return renderCard({ ...brokeCardData(input), tier: BROKE }, size);
  }

  const cert = await getCert(id);
  if (!cert?.paid) return new Response("Not certified (yet).", { status: 404 });
  return renderCard({ ...richCardData(cert), tier: tierFor(cert.amount) }, size);
}
