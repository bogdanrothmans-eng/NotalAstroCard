"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useNav } from "@/lib/nav";
import { T, R } from "@/lib/tokens";
import { Screen, Title, Subtitle, TextField, PrimaryButton, BackSquare } from "@/components/ui";
import { Stepper } from "@/components/ui/Stepper";
import { maskTime, validateTime } from "@/lib/validation";
import type { ApproximatePeriod, BirthTimeAccuracy } from "@/types";

const ACCURACY: { key: BirthTimeAccuracy; label: string }[] = [
  { key: "exact", label: "Точно" },
  { key: "approximate", label: "Примерно" },
  { key: "unknown", label: "Не знаю" },
];
const PERIODS: { key: ApproximatePeriod; label: string }[] = [
  { key: "morning", label: "Утро" },
  { key: "day", label: "День" },
  { key: "evening", label: "Вечер" },
  { key: "night", label: "Ночь" },
];

export default function TimeBirthPage() {
  const b = useAppStore((s) => s.birthData);
  const setBirth = useAppStore((s) => s.setBirth);
  const { go, back } = useNav();

  const [accuracy, setAccuracy] = useState<BirthTimeAccuracy>(b.birthTimeAccuracy || "exact");
  const [time, setTime] = useState(b.birthTime || "");
  const [period, setPeriod] = useState<ApproximatePeriod | undefined>(b.approximatePeriod);
  const [place, setPlace] = useState(b.birthPlace || "");
  const [touched, setTouched] = useState(false);

  const timeErr = accuracy === "exact" && touched ? validateTime(time) : null;
  const periodErr = accuracy === "approximate" && touched && !period ? "Выбери период рождения" : null;
  const placeErr = touched && place.trim().length < 2 ? "Укажи место рождения" : null;

  const canProceed = () => {
    if (place.trim().length < 2) return false;
    if (accuracy === "exact") return !validateTime(time);
    if (accuracy === "approximate") return !!period;
    return true;
  };

  const next = () => {
    if (!canProceed()) {
      setTouched(true);
      return;
    }
    setBirth({
      birthTimeAccuracy: accuracy,
      birthTime: accuracy === "exact" ? time : "",
      approximatePeriod: accuracy === "approximate" ? period : undefined,
      birthPlace: place.trim(),
    });
    go("check");
  };

  const Seg = ({ item }: { item: (typeof ACCURACY)[number] }) => {
    const sel = accuracy === item.key;
    return (
      <button
        onClick={() => {
          setAccuracy(item.key);
          setTouched(false);
        }}
        style={{
          flex: 1,
          height: 50,
          borderRadius: R.chip,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          background: sel ? T.white : T.surface,
          color: sel ? "#000000" : "#FFFFFF",
          border: `1px solid ${sel ? T.white : T.borderSubtle}`,
        }}
      >
        {item.label}
      </button>
    );
  };

  const PeriodBtn = ({ item }: { item: (typeof PERIODS)[number] }) => {
    const sel = period === item.key;
    return (
      <button
        onClick={() => setPeriod(item.key)}
        style={{
          height: 56,
          borderRadius: R.chip,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 500,
          background: sel ? T.surfaceSelected : T.surface,
          color: "#FFFFFF",
          border: `1px solid ${sel ? T.borderStrong : T.borderSubtle}`,
        }}
      >
        {item.label}
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
      <Stepper step={3} />
      <Title>Время рождения</Title>
      <Subtitle>
        Без точного времени разбор будет менее точным. Асцендент и дома определить сложно, но базовый портрет личности
        покажем.
      </Subtitle>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {ACCURACY.map((a) => (
          <Seg key={a.key} item={a} />
        ))}
      </div>

      {accuracy === "exact" && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              background: T.surfaceInput,
              borderRadius: R.input,
              height: 60,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              border: "1px solid transparent",
            }}
          >
            <input
              value={time}
              placeholder="00:00"
              inputMode="numeric"
              maxLength={5}
              onChange={(e) => setTime(maskTime(e.target.value))}
              style={{ background: "transparent", border: "none", outline: "none", width: "100%", color: T.textPrimary, fontSize: 16 }}
            />
          </div>
          {timeErr && <div style={{ color: T.error, fontSize: 13, marginTop: 10 }}>{timeErr}</div>}
        </div>
      )}

      {accuracy === "approximate" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            {PERIODS.map((p) => (
              <PeriodBtn key={p.key} item={p} />
            ))}
          </div>
          {periodErr && <div style={{ color: T.error, fontSize: 13, marginTop: 10 }}>{periodErr}</div>}
        </>
      )}

      <h2 style={{ color: T.textPrimary, fontSize: 20, fontWeight: 700, margin: "26px 0 14px" }}>Место рождения</h2>
      <TextField value={place} placeholder="Например Московская обл., Пушкино" onChange={(e) => setPlace(e.target.value)} error={placeErr} />
    </Screen>
  );
}
