/* ===================================================================================
   Geocoding + timezone helpers for the natal engine.
   Birth place is free text ("Московская обл., Пушкино") → Open-Meteo geocoding
   (free, CORS-enabled, no key) gives lat/lon + IANA timezone. The IANA zone +
   Intl API convert the local birth wall-time into a UTC instant, honouring
   historical offset changes as far as the runtime's tzdata goes.
   =================================================================================== */

export interface GeoPoint {
  latitude: number;
  longitude: number;
  timezone: string; // IANA
  label: string;
  /** false → geocoding failed, coordinates are a fallback (Moscow) */
  resolved: boolean;
}

const FALLBACK: GeoPoint = {
  latitude: 55.7558,
  longitude: 37.6173,
  timezone: "Europe/Moscow",
  label: "",
  resolved: false,
};

interface OpenMeteoResult {
  latitude: number;
  longitude: number;
  timezone?: string;
  name?: string;
  admin1?: string;
  country?: string;
}

async function queryOpenMeteo(name: string): Promise<OpenMeteoResult | null> {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&language=ru&format=json&name=" +
    encodeURIComponent(name);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: OpenMeteoResult[] };
    return data.results?.[0] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve a free-text birth place. Tries the full string first, then individual
 * comma-separated parts starting from the most specific (last) one, so
 * "Московская обл., Пушкино" finds the town even though the full string doesn't match.
 */
export async function geocodeBirthPlace(place: string): Promise<GeoPoint> {
  const candidates = [place.trim()];
  const parts = place
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length >= 2);
  for (const p of parts.slice().reverse()) {
    if (!candidates.includes(p)) candidates.push(p);
  }

  for (const q of candidates) {
    const hit = await queryOpenMeteo(q);
    if (hit && hit.timezone) {
      return {
        latitude: hit.latitude,
        longitude: hit.longitude,
        timezone: hit.timezone,
        label: [hit.name, hit.admin1, hit.country].filter(Boolean).join(", "),
        resolved: true,
      };
    }
  }
  return { ...FALLBACK, label: place };
}

/** Minutes to ADD to UTC to get local wall time in `tz` at the given UTC instant. */
function tzOffsetMinutes(tz: string, utc: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(utc)) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return (asUtc - utc.getTime()) / 60000;
}

/** Convert a local wall-time in an IANA zone to the corresponding UTC instant. */
export function zonedTimeToUtc(
  year: number,
  month: number, // 1..12
  day: number,
  hour: number,
  minute: number,
  tz: string,
): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes converge even across DST transitions.
  let guess = wall;
  for (let i = 0; i < 2; i++) {
    guess = wall - tzOffsetMinutes(tz, new Date(guess)) * 60000;
  }
  return new Date(guess);
}
