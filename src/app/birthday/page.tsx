"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNav } from "@/lib/nav";
import { Screen, Title, Subtitle, TextField, PrimaryButton, BackSquare } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import { maskDate, validateDate } from "@/lib/validation";

export default function BirthdayPage() {
  const birthData = useAppStore((s) => s.birthData);
  const setBirth = useAppStore((s) => s.setBirth);
  const { go, back } = useNav();

  const [date, setDate] = useState(birthData.birthDate);
  const [touched, setTouched] = useState(false);
  const error = touched ? validateDate(date) : null;

  const next = () => {
    if (validateDate(date)) {
      setTouched(true);
      return;
    }
    setBirth({ birthDate: date });
    go("timeBirth");
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
      <Stepper step={2} />
      <Title>Дата рождения</Title>
      <Subtitle>От неё зависит знак зодиака, натальная карта и прогнозы</Subtitle>
      <div style={{ marginTop: 18 }}>
        <TextField
          value={date}
          placeholder="00.00.0000"
          inputMode="numeric"
          maxLength={10}
          onChange={(e) => {
            setDate(maskDate(e.target.value));
            if (touched) setTouched(false);
          }}
          error={error}
        />
      </div>
    </Screen>
  );
}
