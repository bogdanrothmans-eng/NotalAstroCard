"use client";

import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import Image from "next/image";
import { Screen, PrimaryButton } from "@/components/ui";

const FEATURES: [string, string][] = [
  ["Личность", "Что в тебе главное и как ты принимаешь решения"],
  ["Эмоции", "Что тебе нужно, чтобы чувствовать себя спокойно"],
  ["Отношения", "Как ты любишь, сближаешься и защищаешься"],
  ["Сильные стороны", "Где твой природный потенциал"],
];

export default function StartPage() {
  const { go } = useNav();
  return (
    <Screen
      bottom={
        <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <PrimaryButton onClick={() => go("enterName")}>Начать разбор</PrimaryButton>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>Без подписки и сложных терминов</div>
        </div>
      }
    >
      <div style={{ marginTop: 4, display: "flex", justifyContent: "center" }}>
        <Image
          src="/Astrocard.png"
          alt="Планеты и звёзды"
          width={300}
          height={300}
          priority
          style={{ objectFit: "contain" }}
        />
      </div>
      <h1 style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 700, lineHeight: 1.2, margin: "16px 0 24px" }}>
        Узнай себя через натальную карту
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FEATURES.map(([t, s]) => (
          <div key={t} style={{ background: T.surface, borderRadius: 16, padding: 16 }}>
            <div style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>{t}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 4, lineHeight: 1.3 }}>{s}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
