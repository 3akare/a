import { type CertInput, serial } from "./cert";

export type Brokie = CertInput & { id: string; cad: number; at: number };

// Rough rates so a ₦ brokie and a $ brokie can share one board. It's a joke app.
const TO_CAD: Record<string, number> = { cad: 1, usd: 1.38, eur: 1.5, gbp: 1.75, ngn: 0.0009 };

const RANK = "brokies:rank";
const DATA = "brokies:data";

/* Redis (Upstash / Vercel KV) over REST when configured, else in-memory (fine for a local demo). */
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

async function redis<T = unknown>(cmds: (string | number)[][]): Promise<T[]> {
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis said no (${res.status})`);
  return ((await res.json()) as { result: T }[]).map((r) => r.result);
}

const memory = ((globalThis as { __brokies?: Map<string, Brokie> }).__brokies ??= new Map());

export async function addBrokie(input: CertInput): Promise<{ id: string; rank: number; total: number }> {
  const id = serial(`${input.name}|${input.item}|${input.amount}|${input.currency}`);
  const entry: Brokie = { ...input, id, cad: Math.round(input.amount * (TO_CAD[input.currency] ?? 1)), at: Date.now() };

  if (url && token) {
    const [, , rank, total] = await redis<number>([
      ["HSETNX", DATA, id, JSON.stringify(entry)],
      ["ZADD", RANK, entry.cad, id],
      ["ZREVRANK", RANK, id],
      ["ZCARD", RANK],
    ]);
    return { id, rank: rank + 1, total };
  }

  if (!memory.has(id)) memory.set(id, entry);
  const sorted = [...memory.values()].sort((a, b) => b.cad - a.cad);
  return { id, rank: sorted.findIndex((b) => b.id === id) + 1, total: sorted.length };
}

export async function topBrokies(limit = 25): Promise<{ list: Brokie[]; total: number; sum: number }> {
  if (url && token) {
    const [ids, total] = await redis<string[] & number>([
      ["ZRANGE", RANK, 0, limit - 1, "REV"],
      ["ZCARD", RANK],
    ]);
    const list = ids.length ? ((await redis<(string | null)[]>([["HMGET", DATA, ...ids]]))[0] ?? []) : [];
    const parsed = list.filter(Boolean).map((s) => JSON.parse(s!) as Brokie);
    const [scores] = await redis<string[]>([["ZRANGE", RANK, 0, -1, "WITHSCORES"]]);
    const sum = scores.filter((_, i) => i % 2).reduce((a, s) => a + Number(s), 0);
    return { list: parsed, total: Number(total), sum };
  }

  const all = [...memory.values()].sort((a, b) => b.cad - a.cad);
  return { list: all.slice(0, limit), total: all.length, sum: all.reduce((a, b) => a + b.cad, 0) };
}

export async function getBrokie(id: string): Promise<Brokie | null> {
  if (url && token) {
    const [json] = await redis<string | null>([["HGET", DATA, id]]);
    return json ? (JSON.parse(json) as Brokie) : null;
  }
  return memory.get(id) ?? null;
}

export async function removeBrokie(id: string) {
  if (url && token) {
    await redis([
      ["ZREM", RANK, id],
      ["HDEL", DATA, id],
    ]);
    return;
  }
  memory.delete(id);
}
