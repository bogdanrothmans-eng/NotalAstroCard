"use client";

import { useEffect, useState } from "react";

/**
 * True once the component has mounted on the client. Used to gate rendering of
 * persisted Zustand state so SSR markup (empty state) doesn't mismatch the
 * rehydrated client render.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
