"use client";

import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/lib/useHydrated";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { Screen, BackSquare, Card, PrimaryButton } from "@/components/ui";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HistoryPage() {
  const hydrated = useHydrated();
  const { go, back } = useNav();
  const reports = useAppStore((s) => s.reports);

  return (
    <Screen>
      <div style={{ marginBottom: 8 }}>
        <BackSquare onClick={back} />
      </div>
      <h1 style={{ color: T.textPrimary, fontSize: 27, fontWeight: 700, margin: "8px 0 0" }}>История отчётов</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.45, margin: "8px 0 22px" }}>
        Все созданные карты сохраняются локально в браузере
      </p>
      {!hydrated ? null : reports.length === 0 ? (
        <EmptyState onCreate={() => go("enterName")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reports.map((r) => (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: T.textPrimary, fontSize: 19, fontWeight: 700 }}>{r.birthData.name}</div>
                  <div style={{ color: T.textSecondary, fontSize: 13.5, marginTop: 4 }}>{r.birthData.birthDate}</div>
                </div>
                <div style={{ background: T.badge, color: T.badgeText, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 14 }}>
                  {r.isUnlocked ? "Полный" : "Краткий"}
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <PrimaryButton onClick={() => go(r.isUnlocked ? "full" : "short", { id: r.id })}>Открыть</PrimaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
