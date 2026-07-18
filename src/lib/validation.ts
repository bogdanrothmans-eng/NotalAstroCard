/* Input masks + validators for the birth-data wizard. */
import type { BirthData, ApproximatePeriod } from "@/types";

export function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "." + d.slice(2, 4);
  if (d.length > 4) out += "." + d.slice(4, 8);
  return out;
}

export function validateDate(v: string): string | null {
  if (!v) return "Введите дату рождения";
  const m = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return "Укажи корректную дату рождения";
  const dd = +m[1],
    mm = +m[2],
    yyyy = +m[3];
  if (mm < 1 || mm > 12) return "Укажи корректную дату рождения";
  if (dd < 1 || dd > 31) return "Укажи корректную дату рождения";
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd)
    return "Укажи корректную дату рождения";
  if (date > new Date()) return "Дата рождения не может быть в будущем";
  if (yyyy < 1900) return "Укажи корректную дату рождения";
  return null;
}

export function maskTime(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  let out = d.slice(0, 2);
  if (d.length > 2) out += ":" + d.slice(2, 4);
  return out;
}

export function validateTime(v: string): string | null {
  if (!v) return "Укажи корректное время рождения";
  const m = v.match(/^(\d{2}):(\d{2})$/);
  if (!m) return "Укажи корректное время рождения";
  const hh = +m[1],
    mi = +m[2];
  if (hh > 23 || mi > 59) return "Укажи корректное время рождения";
  return null;
}

const PERIOD_LABEL: Record<ApproximatePeriod, string> = {
  morning: "Утро",
  day: "День",
  evening: "Вечер",
  night: "Ночь",
};

export function timeLabel(b: BirthData): string {
  if (b.birthTimeAccuracy === "exact") return b.birthTime || "—";
  if (b.birthTimeAccuracy === "approximate")
    return (b.approximatePeriod && PERIOD_LABEL[b.approximatePeriod]) || "Примерно";
  return "Не знаю";
}
