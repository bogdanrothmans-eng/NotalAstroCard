"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppSettings, BirthData, NatalReport } from "@/types";
import { generateNatalReport } from "@/lib/astro/realNatalEngine";

const emptyBirth: BirthData = {
  name: "",
  gender: null,
  birthDate: "",
  birthTime: "",
  birthTimeAccuracy: "exact",
  approximatePeriod: undefined,
  birthPlace: "",
};

interface AppState {
  birthData: BirthData;
  reports: NatalReport[];
  lastOpenedReportId: string | null;
  settings: AppSettings;

  // actions (mirror the prototype reducer)
  setBirth: (partial: Partial<BirthData>) => void;
  resetBirth: () => void;
  /** Builds a report from the current draft birthData and returns its id. */
  createReport: () => Promise<string>;
  unlock: (id: string) => void;
  setLastOpened: (id: string) => void;
  deleteReport: (id: string) => void;
  clearAll: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      birthData: { ...emptyBirth },
      reports: [],
      lastOpenedReportId: null,
      settings: { insightOfDay: true, newFeatures: false },

      setBirth: (partial) => set((s) => ({ birthData: { ...s.birthData, ...partial } })),

      resetBirth: () => set({ birthData: { ...emptyBirth } }),

      createReport: async () => {
        const report = await generateNatalReport(get().birthData);
        set((s) => ({
          reports: [report, ...s.reports],
          lastOpenedReportId: report.id,
        }));
        return report.id;
      },

      unlock: (id) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, isUnlocked: true, status: "full" } : r,
          ),
        })),

      setLastOpened: (id) => set({ lastOpenedReportId: id }),

      deleteReport: (id) =>
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),

      clearAll: () =>
        set({
          birthData: { ...emptyBirth },
          reports: [],
          lastOpenedReportId: null,
          settings: { insightOfDay: true, newFeatures: false },
        }),

      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
    }),
    {
      name: "natal-app",
      storage: createJSONStorage(() => localStorage),
      // We sync paid/unlock status from the backend, but reports + settings live locally.
      partialize: (s) => ({
        birthData: s.birthData,
        reports: s.reports,
        lastOpenedReportId: s.lastOpenedReportId,
        settings: s.settings,
      }),
    },
  ),
);
