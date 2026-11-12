"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Año actual. En el servidor (prerender estático) se usa el año del build;
 * en el navegador se lee la fecha real. Compatible con Cache Components.
 */
export function CurrentYear({ initial }: { initial: number }) {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => initial);
  return <span>{year}</span>;
}
