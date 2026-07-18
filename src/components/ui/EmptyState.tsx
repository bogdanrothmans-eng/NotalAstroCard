"use client";

import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { BrandMark, PrimaryButton } from "@/components/ui";

export function EmptyState({ onCreate }: { onCreate?: () => void }) {
  const { go } = useNav();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0" }}>
      <BrandMark size={44} glow />
      <div style={{ color: T.textPrimary, fontSize: 18, fontWeight: 700, marginTop: 20 }}>Пока пусто</div>
      <div style={{ color: T.textSecondary, fontSize: 14, marginTop: 8, textAlign: "center", maxWidth: 260 }}>
        Создай первую натальную карту — она появится здесь.
      </div>
      <div style={{ marginTop: 20, width: 200 }}>
        <PrimaryButton onClick={() => (onCreate ? onCreate() : go("enterName"))}>Создать карту</PrimaryButton>
      </div>
    </div>
  );
}
