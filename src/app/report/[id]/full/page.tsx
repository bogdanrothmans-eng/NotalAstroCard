"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Share2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/lib/useHydrated";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { Screen } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchPaidStatus, isInsideTelegram } from "@/lib/telegram";
import { SIGNS_IN } from "@/lib/astro/chart";
import type { FullReportSectionKey } from "@/types";

const SECTIONS: [FullReportSectionKey, string][] = [
  ["overview", "Обзор"],
  ["personality", "Личность"],
  ["emotions", "Эмоции"],
  ["relationships", "Отношения"],
  ["workAndMoney", "Работа"],
  ["strengths", "Сильные стороны"],
  ["growthZones", "Зоны роста"],
  ["recommendations", "Советы"],
];

export default function FullReportPage() {
  const hydrated = useHydrated();
  const params = useParams<{ id: string }>();
  const { go, reset } = useNav();
  const reports = useAppStore((s) => s.reports);
  const unlock = useAppStore((s) => s.unlock);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [active, setActive] = useState<FullReportSectionKey>("overview");

  // Gate access on the backend's paid status. Locally-unlocked reports (just
  // paid) are trusted; otherwise unpaid Telegram users are sent to the paywall.
  useEffect(() => {
    if (!hydrated || !isInsideTelegram()) return;
    const id = params.id;
    const r = reports.find((x) => x.id === id);
    fetchPaidStatus(id).then((paid) => {
      if (paid) {
        if (r && !r.isUnlocked) unlock(id);
      } else if (!r || !r.isUnlocked) {
        go("paywall", { id });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, params.id]);

  if (!hydrated) return null;

  const report = reports.find((r) => r.id === params.id) || reports.find((r) => r.isUnlocked);
  if (!report) return <EmptyState />;
  const b = report.birthData;
  const full = report.fullReport;

  const scrollTo = (key: FullReportSectionKey) => {
    setActive(key);
    refs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Screen>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textTransform: "uppercase" }}>Натальная карта</div>
      <h1 style={{ color: T.textPrimary, fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: "6px 0 0" }}>
        {b.name}
      </h1>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6 }}>
        {b.birthDate} · {b.birthPlace}
      </div>
      {b.birthTimeAccuracy === "unknown" && (
        <div style={{ color: T.textTertiary, fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
          Без точного времени рождения — асцендент и дома могут быть неточными
        </div>
      )}

      {/* summary — glow card */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: T.surface,
          border: `1px solid ${T.borderSubtle}`,
          borderRadius: 16,
          padding: 16,
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ position: "absolute", top: -40, right: -20, width: 200, height: 130, background: "radial-gradient(ellipse at center, rgba(110,90,235,0.42), rgba(110,90,235,0))", filter: "blur(18px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -30, left: -30, width: 150, height: 130, background: "radial-gradient(ellipse at center, rgba(140,99,255,0.36), rgba(140,99,255,0))", filter: "blur(18px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", color: "#FFFFFF", fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>Коротко о тебе</div>
        <div style={{ position: "relative", color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.5 }}>
          {report.chart
            ? [
                `Солнце ${SIGNS_IN[report.chart.sun.signIndex]}`,
                `Луна ${SIGNS_IN[report.chart.moon.signIndex]}`,
                ...(report.chart.ascendant ? [`асцендент ${SIGNS_IN[report.chart.ascendant.signIndex]}`] : []),
              ].join(" · ")
            : "В твоей карте сочетаются устойчивость, чувствительность и сильная внутренняя концентрация. Ты можешь выглядеть спокойно, но внутри проживать всё глубже, чем показываешь."}
        </div>
      </div>

      {/* chips nav (full-bleed scroll) */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 16px", margin: "0 -16px" }}>
        {SECTIONS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => scrollTo(key)}
            style={{
              flexShrink: 0,
              height: 40,
              padding: "0 16px",
              borderRadius: 16,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
              background: active === key ? T.white : T.surface,
              color: active === key ? "#000000" : "#FFFFFF",
              border: `1px solid ${active === key ? T.white : T.borderSubtle}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {SECTIONS.map(([key, label]) => (
        <div
          key={key}
          ref={(el) => {
            refs.current[key] = el;
          }}
          style={{ scrollMarginTop: 12, paddingTop: 8 }}
        >
          <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, letterSpacing: "0.12px", margin: "10px 0 12px" }}>{label}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {full[key].map((item) => (
              <div
                key={item.id}
                style={{ background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 500 }}>{item.title}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* bottom actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "24px 0 8px" }}>
        <button
          onClick={() => alert("Поделиться картой (mock)")}
          style={{ width: "100%", height: 50, borderRadius: 16, background: T.surface, border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Share2 size={16} color="#FFFFFF" /> Поделиться картой
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => reset("enterName")}
            style={{ flex: 1, height: 50, borderRadius: 16, background: T.surface, border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            Новая карта
          </button>
          <button
            onClick={() => reset("main")}
            style={{ flex: 1, height: 50, borderRadius: 16, background: T.white, border: "none", color: "#000000", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            На главную
          </button>
        </div>
      </div>
    </Screen>
  );
}
