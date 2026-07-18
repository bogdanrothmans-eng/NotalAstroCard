"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/lib/useHydrated";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { Screen, ReportBlock } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchPaidStatus, isInsideTelegram } from "@/lib/telegram";

export default function ShortReportPage() {
  const hydrated = useHydrated();
  const params = useParams<{ id: string }>();
  const { go, reset } = useNav();
  const reports = useAppStore((s) => s.reports);
  const unlock = useAppStore((s) => s.unlock);

  // Reconcile unlock status from the backend so the CTA reflects a prior purchase.
  useEffect(() => {
    if (!hydrated || !isInsideTelegram()) return;
    const id = params.id;
    fetchPaidStatus(id).then((paid) => {
      if (paid) unlock(id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, params.id]);

  if (!hydrated) return null;

  const report = reports.find((r) => r.id === params.id) || reports[0];
  if (!report) return <EmptyState />;
  const sr = report.shortReport;

  return (
    <Screen>
      <h1 style={{ color: T.textPrimary, fontSize: 32, fontWeight: 700, lineHeight: 1.0, letterSpacing: "0.12px", margin: 0 }}>
        {sr.title}
      </h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.3, letterSpacing: "0.12px", margin: "8px 0 24px" }}>
        {sr.subtitle}
      </p>

      {sr.blocks.map((b) => (
        <ReportBlock key={b.id} b={b} />
      ))}

      {/* Paywall teaser — #171717 card with soft violet glow blobs */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          padding: 16,
          marginTop: 0,
          background: T.surface,
          border: `1px solid ${T.borderSubtle}`,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ position: "absolute", top: -28, left: -12, width: 130, height: 80, background: "radial-gradient(ellipse at center, rgba(140,99,255,0.55), rgba(140,99,255,0))", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -10, right: -28, width: 90, height: 170, background: "radial-gradient(ellipse at center, rgba(110,90,235,0.5), rgba(110,90,235,0))", filter: "blur(12px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: -28, width: 64, height: 170, background: "radial-gradient(ellipse at center, rgba(150,99,255,0.45), rgba(150,99,255,0))", filter: "blur(12px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ color: "#FFFFFF", fontSize: 12, textTransform: "uppercase", fontWeight: 500 }}>Полный разбор</div>
          <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>Мы откроем больше</div>
        </div>
        <ul
          style={{
            position: "relative",
            margin: 0,
            paddingLeft: 21,
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            lineHeight: 1.4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <li>Как ты проявляешься в отношениях</li>
          <li>Что тебя заряжает и выматывает</li>
          <li>Где твои сильные стороны</li>
          <li>Какие паттерны могут мешать</li>
          <li>Как ты работаешь и принимаешь решения</li>
          <li>Персональные рекомендации</li>
        </ul>
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => (report.isUnlocked ? go("full", { id: report.id }) : go("paywall", { id: report.id }))}
            style={{ width: "100%", height: 50, borderRadius: 16, background: T.white, border: "none", color: "#000000", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            Открыть полный разбор
          </button>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>Один платёж. Без подписки.</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "16px 0 8px" }}>
        <button
          onClick={() => reset("main")}
          style={{ width: "100%", height: 50, borderRadius: 16, background: T.surfaceSelected, border: `1px solid ${T.borderStrong}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          Вернуться на главную
        </button>
        <button
          onClick={() => reset("enterName")}
          style={{ width: "100%", height: 50, borderRadius: 16, background: T.surface, border: `1px solid ${T.borderSubtle}`, color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          Попробовать ещё раз
        </button>
      </div>
    </Screen>
  );
}
