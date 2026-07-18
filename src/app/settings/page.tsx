"use client";

import { useState } from "react";
import { ChevronLeft, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useNav } from "@/lib/nav";
import { T, R } from "@/lib/tokens";
import { Screen, BackSquare, Card, SecondaryButton } from "@/components/ui";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 46,
        height: 28,
        borderRadius: 14,
        border: "none",
        cursor: "pointer",
        position: "relative",
        background: on ? T.white : T.surface2,
        transition: "background .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: on ? T.ink : "#6b6b72",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const clearAll = useAppStore((s) => s.clearAll);
  const { go, back, reset } = useNav();
  const [confirm, setConfirm] = useState(false);

  const Row = ({ label, right, onClick }: { label: string; right: React.ReactNode; onClick?: () => void }) => (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 18px",
        borderTop: `1px solid ${T.border}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <span style={{ color: T.textPrimary, fontSize: 15 }}>{label}</span>
      {right}
    </div>
  );

  return (
    <Screen>
      <div style={{ marginBottom: 8 }}>
        <BackSquare onClick={back} />
      </div>
      <h1 style={{ color: T.textPrimary, fontSize: 27, fontWeight: 700, margin: "8px 0 22px" }}>Настройки</h1>
      <Card style={{ padding: 4 }}>
        <Row
          label="История отчётов"
          right={<ChevronLeft size={18} color={T.textTertiary} style={{ transform: "rotate(180deg)" }} />}
          onClick={() => go("history")}
        />
        <Row
          label="Инсайт дня"
          right={<Toggle on={settings.insightOfDay} onClick={() => updateSettings({ insightOfDay: !settings.insightOfDay })} />}
        />
        <Row
          label="Новые функции"
          right={<Toggle on={settings.newFeatures} onClick={() => updateSettings({ newFeatures: !settings.newFeatures })} />}
        />
        <Row label="Восстановить покупки" right={<span style={{ color: T.textTertiary, fontSize: 13 }}>›</span>} onClick={() => alert("Покупки восстановлены (mock)")} />
        <Row label="Помощь" right={<span style={{ color: T.textTertiary, fontSize: 13 }}>›</span>} onClick={() => alert("Поддержка: support@example.com (mock)")} />
      </Card>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => setConfirm(true)}
          style={{
            width: "100%",
            height: 56,
            borderRadius: R.button,
            background: T.surface,
            border: `1px solid ${T.border}`,
            color: T.error,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Trash2 size={16} color={T.error} /> Удалить данные
        </button>
      </div>
      {confirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 30, display: "flex", alignItems: "flex-end" }}>
          <div onClick={() => setConfirm(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <div
            style={{
              position: "relative",
              width: "100%",
              background: T.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
              animation: "slideUp .25s ease",
            }}
          >
            <div style={{ color: T.textPrimary, fontSize: 18, fontWeight: 700 }}>Удалить все данные?</div>
            <div style={{ color: T.textSecondary, fontSize: 14, marginTop: 8, lineHeight: 1.45 }}>
              Все созданные карты и настройки будут стёрты. Это действие необратимо.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <SecondaryButton outlined onClick={() => setConfirm(false)}>
                Отмена
              </SecondaryButton>
              <button
                onClick={() => {
                  clearAll();
                  reset("start");
                }}
                style={{ flex: 1, height: 56, borderRadius: R.button, background: T.error, border: "none", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  );
}
