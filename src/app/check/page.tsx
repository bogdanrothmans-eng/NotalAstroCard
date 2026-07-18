"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNav } from "@/lib/nav";
import { T, R } from "@/lib/tokens";
import { Screen, Title, Subtitle, PrimaryButton, BackSquare, Card } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import { timeLabel } from "@/lib/validation";

export default function CheckPage() {
  const b = useAppStore((s) => s.birthData);
  const createReport = useAppStore((s) => s.createReport);
  const { go } = useNav();

  const rows: [string, string][] = [
    ["Имя", b.name],
    ["Дата рождения", b.birthDate],
    ["Время рождения", timeLabel(b)],
    ["Место рождения", b.birthPlace],
  ];

  const [building, setBuilding] = useState(false);

  const build = async () => {
    if (building) return;
    setBuilding(true);
    try {
      await createReport();
      go("loading");
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Screen
      bottom={
        <div style={{ display: "flex", gap: 12 }}>
          <BackSquare onClick={() => go("timeBirth")} />
          <PrimaryButton onClick={build}>{building ? "Строим карту…" : "Построить карту"}</PrimaryButton>
        </div>
      }
    >
      <Stepper step={3} />
      <Title>Проверь данные</Title>
      <Subtitle>
        По ним мы построим натальную карту. Если что-то указано неверно, разбор может получиться неточным.
      </Subtitle>
      <Card style={{ marginTop: 24, padding: 16 }}>
        {rows.map(([label, val], i) => (
          <div
            key={label}
            style={{
              paddingTop: i ? 8 : 0,
              marginTop: i ? 8 : 0,
              borderTop: i ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}
          >
            <div style={{ color: T.textSecondary, fontSize: 10, letterSpacing: "0.12px", lineHeight: 1.3 }}>{label}</div>
            <div style={{ color: T.value, fontSize: 16, marginTop: 2, lineHeight: "24px" }}>{val || "—"}</div>
          </div>
        ))}
      </Card>
      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => go("enterName")}
          style={{
            width: "100%",
            height: 50,
            borderRadius: R.button,
            background: T.surface,
            border: `1px solid ${T.borderSubtle}`,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Изменить данные
        </button>
      </div>
    </Screen>
  );
}
