/* ===================================================================================
   Domain types for the natal-card flow.
   =================================================================================== */

export type Gender = "female" | "male";

export type BirthTimeAccuracy = "exact" | "approximate" | "unknown";

export type ApproximatePeriod = "morning" | "day" | "evening" | "night";

export interface BirthData {
  name: string;
  gender: Gender | null;
  birthDate: string; // dd.mm.yyyy
  birthTime: string; // HH:mm (when accuracy === "exact")
  birthTimeAccuracy: BirthTimeAccuracy;
  approximatePeriod?: ApproximatePeriod;
  birthPlace: string;
}

/** A single block in the short report. */
export interface ShortReportBlock {
  id: string;
  label?: string;
  title: string;
  text: string;
  meta?: string;
}

export interface ShortReport {
  title: string;
  subtitle: string;
  blocks: ShortReportBlock[];
}

/** A single item inside a full-report section. */
export interface FullReportBlock {
  id: string;
  title: string;
  text: string;
  subtitle?: string;
}

export type FullReportSectionKey =
  | "overview"
  | "personality"
  | "emotions"
  | "relationships"
  | "workAndMoney"
  | "strengths"
  | "growthZones"
  | "recommendations";

export type FullReport = Record<FullReportSectionKey, FullReportBlock[]>;

export type ReportStatus = "short" | "full";

export interface NatalReport {
  id: string;
  birthData: BirthData;
  /** Computed astronomical chart. Absent on reports created by the old mock engine. */
  chart?: import("@/lib/astro/chart").ChartSummary;
  status: ReportStatus;
  isUnlocked: boolean;
  createdAt: string;
  shortReport: ShortReport;
  fullReport: FullReport;
}

export interface AppSettings {
  insightOfDay: boolean;
  newFeatures: boolean;
}
