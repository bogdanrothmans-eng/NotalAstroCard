"use client";

import { useEffect } from "react";
import { Clock, Settings as SettingsIcon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/lib/useHydrated";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { Screen, Tile } from "@/components/ui";
import { generateTodayInsight } from "@/lib/astro/realNatalEngine";

export default function HomePage() {
  const hydrated = useHydrated();
  const { go, router } = useNav();
  const reports = useAppStore((s) => s.reports);
  const lastOpenedReportId = useAppStore((s) => s.lastOpenedReportId);
  const draftName = useAppStore((s) => s.birthData.name);

  // First-time users have no reports → send to onboarding.
  useEffect(() => {
    if (hydrated && reports.length === 0) router.replace("/start");
  }, [hydrated, reports.length, router]);

  if (!hydrated || reports.length === 0) return null;

  const last = reports.find((r) => r.id === lastOpenedReportId) || reports[0];
  const insight = generateTodayInsight(last);
  const name = last?.birthData.name || draftName || "друг";

  return (
    <Screen>
      <h1 style={{ color: T.textPrimary, fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: "4px 0 0" }}>
        Привет, {name}
      </h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.3, letterSpacing: "0.12px", margin: "8px 0 24px" }}>
        Можно вернуться к готовому разбору или добавить новую карту
      </p>

      {/* Add card — #171717 with violet/blue glow blobs */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
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
        <div style={{ position: "absolute", top: -50, right: -20, width: 220, height: 140, background: "radial-gradient(ellipse at center, rgba(80,105,235,0.5), rgba(80,105,235,0))", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -40, left: -40, width: 180, height: 140, background: "radial-gradient(ellipse at center, rgba(140,99,255,0.42), rgba(140,99,255,0))", filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>Добавить ментальную карту</div>
        <div style={{ position: "relative", color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>
          Для себя, партнёра или человека, которого хочется понять чуть спокойнее
        </div>
        <button
          onClick={() => go("enterName")}
          style={{ position: "relative", width: "100%", height: 50, borderRadius: 16, background: T.white, border: "none", color: "#000000", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          Добавить
        </button>
      </div>

      {/* Insight card */}
      <div style={{ background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>Сегодняшний инсайт</div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{insight}</div>
      </div>

      {/* Tiles */}
      <div style={{ display: "flex", gap: 8 }}>
        <Tile icon={<Clock size={24} color="#FFFFFF" />} label="История" onClick={() => go("history")} />
        <Tile icon={<SettingsIcon size={24} color="#FFFFFF" />} label="Настройки" onClick={() => go("settings")} />
      </div>
    </Screen>
  );
}
