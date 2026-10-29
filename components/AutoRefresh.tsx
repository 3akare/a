"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-fetches the server data every few seconds — leave it on the projector. */
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), ms);
    return () => clearInterval(t);
  }, [router, ms]);
  return null;
}
