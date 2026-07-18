/* ===================================================================================
   Real astronomical chart computation (astronomy-engine).
   Input: BirthData + geocoded place → ecliptic longitudes of Sun/Moon/Mercury/
   Venus/Mars, zodiac signs, ascendant (when birth time allows), element balance.
   Pure math — no texts here; interpretation lives in texts.ts / realNatalEngine.ts.
   =================================================================================== */
import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  SiderealTime,
  SunPosition,
} from "astronomy-engine";
import type { ApproximatePeriod, BirthData } from "@/types";
import { geocodeBirthPlace, zonedTimeToUtc, type GeoPoint } from "./geo";

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export interface PlanetPosition {
  /** 0..11 = Овен..Рыбы */
  signIndex: number;
  /** ecliptic longitude, deg 0..360 */
  longitude: number;
}

export interface ChartSummary {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  /** null when birth time is unknown or place could not be geocoded */
  ascendant: PlanetPosition | null;
  /** counts per element across sun/moon/mercury/venus/mars (+asc when present) */
  elements: Record<Element, number>;
  dominantElement: Element;
  weakestElement: Element;
  /** where the birth place resolved to; empty label when geocoding failed */
  placeLabel: string;
  placeResolved: boolean;
  utc: string; // ISO instant used for the computation
}

export const SIGNS = [
  "Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева",
  "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы",
] as const;

/** «Солнце …» — предложный падеж вместе с предлогом («во Льве», «в Овне»). */
export const SIGNS_IN = [
  "в Овне", "в Тельце", "в Близнецах", "в Раке", "во Льве", "в Деве",
  "в Весах", "в Скорпионе", "в Стрельце", "в Козероге", "в Водолее", "в Рыбах",
] as const;

const ELEMENTS: Element[] = ["fire", "earth", "air", "water"];
const MODALITIES: Modality[] = ["cardinal", "fixed", "mutable"];

export function elementOf(signIndex: number): Element {
  return ELEMENTS[signIndex % 4];
}
export function modalityOf(signIndex: number): Modality {
  return MODALITIES[signIndex % 3];
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function toPosition(longitude: number): PlanetPosition {
  const lon = norm360(longitude);
  return { signIndex: Math.floor(lon / 30) % 12, longitude: lon };
}

function planetLongitude(body: Body, date: Date): number {
  // GeoVector (J2000 equatorial) → true ecliptic of date.
  const vec = GeoVector(body, date, true);
  return Ecliptic(vec).elon;
}

/** Mean obliquity of the ecliptic, degrees (Meeus; plenty for sign-level asc). */
function meanObliquity(date: Date): number {
  const T = (date.getTime() / 86400000 - 10957.5) / 36525; // Julian centuries since J2000
  return 23.43929111 - 0.01300417 * T - 1.638e-7 * T * T;
}

/**
 * Ascendant ecliptic longitude from UTC instant + geographic coordinates.
 * RAMC = local apparent sidereal time in degrees.
 */
export function ascendantLongitude(date: Date, latitudeDeg: number, longitudeEastDeg: number): number {
  const lstDeg = norm360(SiderealTime(date) * 15 + longitudeEastDeg);
  const ramc = (lstDeg * Math.PI) / 180;
  const eps = (meanObliquity(date) * Math.PI) / 180;
  const phi = (latitudeDeg * Math.PI) / 180;
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return norm360((asc * 180) / Math.PI);
}

/** Representative wall-clock time for each approximate period. */
const PERIOD_TIME: Record<ApproximatePeriod, [number, number]> = {
  morning: [9, 0],
  day: [14, 0],
  evening: [19, 0],
  night: [3, 0],
};

export function birthInstant(b: BirthData, tz: string): Date {
  const [dd, mm, yyyy] = b.birthDate.split(".").map((n) => parseInt(n, 10));
  let hour = 12;
  let minute = 0;
  if (b.birthTimeAccuracy === "exact" && /^\d{2}:\d{2}$/.test(b.birthTime)) {
    const [h, m] = b.birthTime.split(":").map((n) => parseInt(n, 10));
    hour = h;
    minute = m;
  } else if (b.birthTimeAccuracy === "approximate" && b.approximatePeriod) {
    [hour, minute] = PERIOD_TIME[b.approximatePeriod];
  }
  return zonedTimeToUtc(yyyy, mm, dd, hour, minute, tz);
}

export function computeChartAt(date: Date, geo: GeoPoint, withAscendant: boolean): ChartSummary {
  const sun = toPosition(SunPosition(date).elon);
  const moon = toPosition(EclipticGeoMoon(date).lon);
  const mercury = toPosition(planetLongitude(Body.Mercury, date));
  const venus = toPosition(planetLongitude(Body.Venus, date));
  const mars = toPosition(planetLongitude(Body.Mars, date));
  const ascendant =
    withAscendant && geo.resolved
      ? toPosition(ascendantLongitude(date, geo.latitude, geo.longitude))
      : null;

  const elements: Record<Element, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  const bodies = [sun, moon, mercury, venus, mars, ...(ascendant ? [ascendant] : [])];
  for (const p of bodies) elements[elementOf(p.signIndex)]++;

  let dominantElement: Element = "fire";
  let weakestElement: Element = "fire";
  for (const el of ELEMENTS) {
    if (elements[el] > elements[dominantElement]) dominantElement = el;
    if (elements[el] < elements[weakestElement]) weakestElement = el;
  }

  return {
    sun, moon, mercury, venus, mars, ascendant,
    elements, dominantElement, weakestElement,
    placeLabel: geo.label,
    placeResolved: geo.resolved,
    utc: date.toISOString(),
  };
}

/** Geocode + compute. Never throws: falls back to Moscow tz without ascendant. */
export async function computeChart(b: BirthData): Promise<ChartSummary> {
  const geo = await geocodeBirthPlace(b.birthPlace);
  const date = birthInstant(b, geo.timezone);
  const withAsc = b.birthTimeAccuracy !== "unknown";
  return computeChartAt(date, geo, withAsc);
}
