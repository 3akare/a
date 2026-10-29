import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Tier } from "./tiers";

const font = (f: string) => readFile(join(process.cwd(), "assets/fonts", f));
const fonts = Promise.all([
  font("bricolage-grotesque-latin-800-normal.woff"),
  font("dela-gothic-one-latin-400-normal.woff"),
  font("space-mono-latin-700-normal.woff"),
  font("dm-sans-latin-700-normal.woff"),
]);

export type CardData = {
  kicker: string; // "CERTIFIED" | "OFFICIALLY"
  tier: Tier;
  headline: string; // "Jeff can afford a yacht. Twice."
  amount: string; // "CA$4,999"
  serial: string;
  date: string;
};

export const OG = { width: 1200, height: 630 };
export const STORY = { width: 1080, height: 1350 };

const INK = "#111111";
const CREAM = "#FFF6E5";

export async function renderCard(d: CardData, size: "og" | "story" = "og") {
  const [display, number, mono, body] = await fonts;
  const story = size === "story";
  const dim = story ? STORY : OG;

  // Shrink text so long words / names never spill out of the card.
  const colW = story ? 820 : 700;
  const title = d.tier.title.toUpperCase();
  const longest = Math.max(...title.split(" ").map((w) => w.length));
  const titleSize = Math.min(story ? 130 : 76, Math.floor(colW / (longest * 0.82)));
  const headSize = fit(d.headline.length, story ? [46, 40, 34] : [30, 26, 22]);
  const sealSize = story ? 230 : 270;
  const amountRoom = story ? colW - sealSize - 40 : colW;
  const amountSize = Math.min(story ? 64 : 44, Math.floor((amountRoom - 60) / (d.amount.length * 0.8)));

  const seal = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: sealSize,
        height: sealSize,
        borderRadius: 9999,
        border: `6px solid ${INK}`,
        background: "linear-gradient(135deg, #FFF1A8 0%, #FFD23F 45%, #E0A800 100%)",
        boxShadow: `8px 8px 0 ${INK}`,
        transform: "rotate(-8deg)",
      }}
    >
      <div style={{ fontSize: story ? 110 : 115, lineHeight: 1 }}>{d.tier.emoji}</div>
      <div style={{ fontFamily: "Mono", fontSize: story ? 22 : 20, letterSpacing: 3, marginTop: 8 }}>{`No. ${d.serial}`}</div>
    </div>
  );

  const sticker = (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: story ? 64 : 30,
        right: story ? 60 : 40,
        padding: story ? "16px 32px" : "12px 24px",
        borderRadius: 9999,
        border: `5px solid ${INK}`,
        background: "#FF4DA6",
        color: INK,
        fontFamily: "Display",
        fontSize: story ? 40 : 30,
        boxShadow: `0 0 0 6px #fff, 6px 6px 0 6px ${INK}`,
        transform: "rotate(8deg)",
      }}
    >
      {d.tier.sticker}
    </div>
  );

  const amount = (
    <div
      style={{
        display: "flex",
        alignSelf: story ? "center" : "flex-start",
        marginTop: story ? 0 : 4,
        padding: story ? "10px 26px" : "6px 20px",
        borderRadius: 20,
        border: `5px solid ${INK}`,
        background: d.tier.color,
        fontFamily: "Number",
        fontSize: amountSize,
      }}
    >
      {d.amount}
    </div>
  );

  const text = (
    <div style={{ display: "flex", flexDirection: "column", width: colW, gap: story ? 22 : 12 }}>
      <div style={{ fontFamily: "Mono", fontSize: story ? 28 : 22, letterSpacing: 4 }}>
        {`CERT No. ${d.serial} · ${d.date}`}
      </div>
      <div style={{ fontFamily: "Display", fontSize: story ? 56 : 40, lineHeight: 1 }}>{d.kicker}</div>
      <div style={{ fontFamily: "Number", fontSize: titleSize, lineHeight: 0.95, letterSpacing: -2 }}>
        {title}
      </div>
      <div style={{ fontFamily: "Body", fontSize: headSize, lineHeight: 1.2, width: "100%" }}>
        {d.headline}
      </div>
      {story ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 16 }}>
          {amount}
          {seal}
        </div>
      ) : (
        amount
      )}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: story ? 56 : 36,
          background: d.tier.color,
          color: INK,
          fontFamily: "Body",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: story ? "column" : "row",
            alignItems: story ? "flex-start" : "center",
            position: "relative",
            flex: 1,
            gap: story ? 40 : 40,
            padding: story ? "190px 64px 90px" : "36px 48px 60px",
            background: CREAM,
            border: `7px solid ${INK}`,
            borderRadius: story ? 64 : 44,
            boxShadow: `14px 14px 0 ${INK}`,
          }}
        >
          {text}
          {!story && seal}
          {sticker}
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: story ? 64 : 56,
              bottom: story ? 40 : 22,
              fontFamily: "Mono",
              fontSize: story ? 22 : 20,
              letterSpacing: story ? 1 : 2,
              opacity: 0.7,
            }}
          >
            HOW RICH ARE YOU? · VERIFIED BY ABSOLUTELY NO ONE
          </div>
        </div>
      </div>
    ),
    {
      ...dim,
      emoji: "noto",
      fonts: [
        { name: "Display", data: display, weight: 800, style: "normal" },
        { name: "Number", data: number, weight: 400, style: "normal" },
        { name: "Mono", data: mono, weight: 700, style: "normal" },
        { name: "Body", data: body, weight: 700, style: "normal" },
      ],
    },
  );
}

function fit(len: number, [big, mid, small]: number[]) {
  return len > 80 ? small : len > 50 ? mid : big;
}
