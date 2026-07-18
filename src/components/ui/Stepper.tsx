"use client";

import { Fragment } from "react";
import { Check, Moon } from "lucide-react";

/**
 * Step moon (active state): white 14px disc with white glow + a 12px dark
 * crescent (#171717) on top, sitting inside the shared 24px base circle.
 */
function StepMoon() {
  return (
    <div style={{ position: "relative", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 0 16px 2px rgba(255,255,255,0.85)",
        }}
      />
      <Moon size={12} color="#171717" fill="#171717" strokeWidth={0} style={{ position: "relative" }} />
    </div>
  );
}

/**
 * Stepper. Base: 24px circle #2A2A2A + white 35% stroke.
 * future = empty, done = check, active = white disc + dark moon.
 */
export function Stepper({ step }: { step: number }) {
  const items = [1, 2, 3];
  const base: React.CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2A2A2A",
    border: "1px solid rgba(255,255,255,0.35)",
  };
  return (
    <div className="flex items-center w-full" style={{ gap: 0, marginBottom: 28 }}>
      {items.map((n, i) => {
        const done = n < step;
        const active = n === step;
        return (
          <Fragment key={n}>
            <div style={base}>
              {active ? <StepMoon /> : done ? <Check size={13} color="rgba(255,255,255,0.7)" strokeWidth={2.5} /> : null}
            </div>
            {i < items.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: "0 8px", borderTop: "1.5px dashed rgba(255,255,255,0.22)" }} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
