"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Maps the prototype's logical screen names to App Router URLs, so screen code
 * ported from reference/natal-app-prototype.jsx can keep calling go/back/reset.
 */
export type ScreenName =
  | "start"
  | "main"
  | "enterName"
  | "birthday"
  | "timeBirth"
  | "check"
  | "loading"
  | "short"
  | "full"
  | "paywall"
  | "history"
  | "settings";

export function routeFor(name: ScreenName, params: { id?: string } = {}): string {
  switch (name) {
    case "start":
      return "/start";
    case "main":
      return "/";
    case "enterName":
      return "/enter-name";
    case "birthday":
      return "/birthday";
    case "timeBirth":
      return "/time-birth";
    case "check":
      return "/check";
    case "loading":
      return "/loading";
    case "short":
      return `/report/${params.id}/short`;
    case "full":
      return `/report/${params.id}/full`;
    case "paywall":
      return `/paywall/${params.id}`;
    case "history":
      return "/history";
    case "settings":
      return "/settings";
    default:
      return "/";
  }
}

export function useNav() {
  const router = useRouter();

  const go = useCallback(
    (name: ScreenName, params: { id?: string } = {}) => router.push(routeFor(name, params)),
    [router],
  );
  const back = useCallback(() => router.back(), [router]);
  const reset = useCallback(
    (name: ScreenName, params: { id?: string } = {}) => router.replace(routeFor(name, params)),
    [router],
  );

  return { go, back, reset, router };
}
