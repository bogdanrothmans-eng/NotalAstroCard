"use client";

import { useEffect } from "react";
import { T } from "@/lib/tokens";

/**
 * Outer phone frame: centers a max-width column on a black backdrop and pins it
 * to the dynamic viewport height, matching the prototype shell. Also expands the
 * Telegram WebApp viewport when running inside Telegram.
 */
export function AppFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          background: T.bg,
          position: "relative",
          height: "100dvh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
