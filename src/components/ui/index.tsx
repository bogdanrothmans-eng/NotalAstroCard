"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { T, R } from "@/lib/tokens";
import type { ShortReportBlock } from "@/types";

export function BrandMark({ size = 26, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: -size * 0.7,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)",
            filter: "blur(2px)",
          }}
        />
      )}
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ position: "relative" }}>
        <circle cx="16" cy="16" r="15" fill={T.white} />
        <path d="M21 16a8 8 0 1 1-8-8 6.4 6.4 0 1 0 8 8Z" fill={T.ink} />
      </svg>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? "#3A3A3D" : T.white,
        color: disabled ? "#9a9aa0" : T.ink,
        border: "none",
        borderRadius: R.button,
        height: 56,
        width: "100%",
        fontSize: 16,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        transition: "transform .12s ease, opacity .2s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  outlined,
}: {
  children: ReactNode;
  onClick?: () => void;
  outlined?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: T.surface,
        color: T.textPrimary,
        border: outlined ? `1px solid ${T.border}` : "none",
        borderRadius: R.button,
        height: 56,
        width: "100%",
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function BackSquare({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        borderRadius: R.back,
        background: T.surface,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <ChevronLeft size={22} color={T.textPrimary} />
    </button>
  );
}

/** Screen shell: scroll area + optional sticky bottom bar (safe-area aware). */
export function Screen({
  children,
  bottom,
  pad = true,
}: {
  children: ReactNode;
  bottom?: ReactNode;
  pad?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: pad ? "24px 16px 16px" : 0 }}>{children}</div>
      {bottom && (
        <div style={{ padding: "10px 16px calc(16px + env(safe-area-inset-bottom))", background: T.bg }}>
          {bottom}
        </div>
      )}
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <h1 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: 0 }}>
      {children}
    </h1>
  );
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.45, margin: "8px 0 0" }}>{children}</p>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <div style={{ color: T.textSecondary, fontSize: 12, marginBottom: 6 }}>{children}</div>;
}

export function TextField({
  value,
  onChange,
  placeholder,
  error,
  inputMode,
  maxLength,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
  inputMode?: "numeric" | "text";
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div
        style={{
          background: T.surfaceInput,
          borderRadius: R.input,
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          border: focused ? `1px solid ${T.borderStrong}` : "1px solid transparent",
          transition: "border-color .15s ease",
        }}
      >
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            width: "100%",
            color: T.value,
            fontSize: 16,
            letterSpacing: "-0.32px",
            caretColor: T.white,
          }}
        />
      </div>
      {error && <div style={{ color: T.error, fontSize: 13, marginTop: 10, fontWeight: 500 }}>{error}</div>}
    </div>
  );
}

export function Card({
  children,
  style,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ background: T.surface, borderRadius: R.card, padding: 16, border: `1px solid ${T.borderSubtle}`, ...style }}
    >
      {children}
    </div>
  );
}

export function ReportBlock({ b }: { b: ShortReportBlock }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {b.label && (
          <div style={{ color: "#FFFFFF", fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>{b.label}</div>
        )}
        <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>{b.title}</div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{b.text}</div>
      {b.meta && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{b.meta}</div>}
    </div>
  );
}

export function Tile({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: T.surface,
        border: "none",
        borderRadius: 16,
        padding: 16,
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <div style={{ background: "#282828", borderRadius: 72, padding: 8, display: "flex" }}>{icon}</div>
      <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500 }}>{label}</div>
    </button>
  );
}
