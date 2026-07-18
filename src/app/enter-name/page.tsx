"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNav } from "@/lib/nav";
import { T, R } from "@/lib/tokens";
import { Screen, Title, Subtitle, TextField, PrimaryButton, BackSquare } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import type { Gender } from "@/types";

export default function EnterNamePage() {
  const birthData = useAppStore((s) => s.birthData);
  const setBirth = useAppStore((s) => s.setBirth);
  const { go, back } = useNav();

  const [name, setName] = useState(birthData.name);
  const [gender, setGender] = useState<Gender | null>(birthData.gender);
  const [touched, setTouched] = useState(false);
  const error = touched && !name.trim() ? "Введите имя" : null;

  const next = () => {
    if (!name.trim()) {
      setTouched(true);
      return;
    }
    setBirth({ name: name.trim(), gender });
    go("birthday");
  };

  const GenderBtn = ({ val, label }: { val: Gender; label: string }) => {
    const sel = gender === val;
    return (
      <button
        onClick={() => setGender(val)}
        style={{
          flex: 1,
          height: 50,
          borderRadius: R.chip,
          cursor: "pointer",
          background: sel ? T.surfaceSelected : T.surface,
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 500,
          border: `1px solid ${sel ? T.borderStrong : T.borderSubtle}`,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <Screen
      bottom={
        <div style={{ display: "flex", gap: 12 }}>
          <BackSquare onClick={back} />
          <PrimaryButton onClick={next}>Продолжить</PrimaryButton>
        </div>
      }
    >
      <Stepper step={1} />
      <Title>Введите имя</Title>
      <Subtitle>Нужно для персонализации</Subtitle>
      <div style={{ marginTop: 18 }}>
        <TextField value={name} placeholder="Например Дарья" onChange={(e) => setName(e.target.value)} error={error} />
      </div>
      <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, margin: "28px 0 14px" }}>Укажите пол</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <GenderBtn val="female" label="Женский" />
        <GenderBtn val="male" label="Мужской" />
      </div>
    </Screen>
  );
}
