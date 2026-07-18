/* ===================================================================================
   REAL NATAL ENGINE
   Replaces mockNatalEngine: computes actual planetary positions (astronomy-engine)
   from birth date/time/place, then assembles the report from interpretation banks
   in texts.ts. Report shape is unchanged — UI and payments are untouched.
   =================================================================================== */
import type {
  BirthData,
  FullReport,
  NatalReport,
  ShortReport,
  ShortReportBlock,
} from "@/types";
import {
  computeChart,
  elementOf,
  modalityOf,
  SIGNS,
  SIGNS_IN,
  type ChartSummary,
  type Element,
} from "./chart";
import * as TX from "./texts";

function ascendantBlock(b: BirthData, chart: ChartSummary): ShortReportBlock {
  const asc = chart.ascendant;
  if (b.birthTimeAccuracy === "unknown") {
    return {
      id: "asc",
      label: "Как тебя видят",
      title: "Асцендент пока недоступен",
      text: "Без точного времени рождения асцендент и дома рассчитать нельзя. Базовый портрет личности это не ломает — он остаётся точным.",
      meta: "Добавь время рождения, чтобы открыть этот блок",
    };
  }
  if (!asc) {
    return {
      id: "asc",
      label: "Как тебя видят",
      title: "Асцендент не рассчитан",
      text: "Мы не смогли распознать место рождения, а без координат асцендент не вычислить. Проверь название места в новой карте — базовый портрет от этого не страдает.",
      meta: "Место рождения не распознано",
    };
  }
  if (b.birthTimeAccuracy === "approximate") {
    return {
      id: "asc",
      label: "Как тебя видят",
      title: `Асцендент — примерно ${SIGNS_IN[asc.signIndex]}`,
      text: `Время указано приблизительно, поэтому асцендент считаем мягко: скорее всего, это ${SIGNS[asc.signIndex]} или соседний знак. ${TX.ASC_SHORT[asc.signIndex]}`,
      meta: "Рассчитано по приблизительному времени",
    };
  }
  return {
    id: "asc",
    label: "Как тебя видят",
    title: `Асцендент ${SIGNS_IN[asc.signIndex]}`,
    text: TX.ASC_SHORT[asc.signIndex],
    meta: `Астрологическая основа: Асцендент ${SIGNS_IN[asc.signIndex]}`,
  };
}

export function buildShortReport(b: BirthData, chart: ChartSummary): ShortReport {
  const name = b.name || "ты";
  const sunEl = elementOf(chart.sun.signIndex);
  const moonEl = elementOf(chart.moon.signIndex);
  const insight = TX.INSIGHT_PAIR[`${sunEl}_${moonEl}`];
  return {
    title: `${name}, твоя натальная карта готова`,
    subtitle: "Сначала инсайты, потом астрологическая основа. Все простым языком",
    blocks: [
      {
        id: "sun",
        label: "Личность",
        title: `Солнце ${SIGNS_IN[chart.sun.signIndex]}`,
        text: TX.SUN_SHORT[chart.sun.signIndex],
        meta: `Астрологическая основа: Солнце ${SIGNS_IN[chart.sun.signIndex]}`,
      },
      {
        id: "moon",
        label: "Эмоции",
        title: `Луна ${SIGNS_IN[chart.moon.signIndex]}`,
        text: TX.MOON_SHORT[chart.moon.signIndex],
        meta: `Астрологическая основа: Луна ${SIGNS_IN[chart.moon.signIndex]}`,
      },
      ascendantBlock(b, chart),
      { id: "insight", label: "Главный инсайт", title: insight.title, text: insight.text },
    ],
  };
}

const blk = (id: string, title: string, text: string) => ({ id, title, text });

function elementBalanceText(chart: ChartSummary): string {
  const dom = chart.dominantElement;
  const weak = chart.weakestElement;
  const domName = TX.ELEMENT_NAME_RU[dom];
  const capDom = domName.charAt(0).toUpperCase() + domName.slice(1);
  if (chart.elements[dom] === chart.elements[weak]) {
    return "Стихии в твоей карте распределены на редкость ровно: тебе доступны и энергия, и практичность, и лёгкость, и глубина. Вопрос лишь в том, какую из них ты сейчас тренируешь.";
  }
  return `${capDom} — ведущая стихия твоей карты: она даёт тебе ${TX.ELEMENT_GIVES[dom]}. Меньше всего в карте стихии «${TX.ELEMENT_NAME_RU[weak]}»: ${TX.ELEMENT_LACK_HINT[weak]}.`;
}

export function buildFullReport(b: BirthData, chart: ChartSummary): FullReport {
  const sun = chart.sun.signIndex;
  const moon = chart.moon.signIndex;
  const sunEl = elementOf(sun);
  const moonEl = elementOf(moon);
  const sunMod = modalityOf(sun);
  const moonMod = modalityOf(moon);
  const venusEl = elementOf(chart.venus.signIndex);
  const marsEl = elementOf(chart.mars.signIndex);
  const marsMod = modalityOf(chart.mars.signIndex);
  const manifestEl: Element = chart.ascendant ? elementOf(chart.ascendant.signIndex) : moonEl;

  // Сильные стороны: 3 от стихии Солнца + 2 от стихии Луны (без дублей).
  const sunStrengths = TX.STRENGTHS_BY_ELEMENT[sunEl];
  const moonStrengths = TX.STRENGTHS_BY_ELEMENT[moonEl].filter(
    (s) => !sunStrengths.slice(0, 3).some((x) => x.title === s.title),
  );
  const strengths = [...sunStrengths.slice(0, 3), ...moonStrengths.slice(0, 2)];

  const recs = [...TX.REC_BY_MOON_ELEMENT[moonEl], ...TX.REC_BY_SUN_MODALITY[sunMod]];

  return {
    overview: [
      blk("ov1", "Общий портрет", `${TX.SUN_CORE[sun]} ${TX.MOON_CORE[moon]}`),
      blk("ov2", "Главная сила", TX.STRENGTH_BY_SUN_ELEMENT[sunEl]),
      blk("ov3", "Главная зона роста", TX.GROWTH_BY_MOON_ELEMENT[moonEl]),
      blk("ov4", "Баланс стихий", elementBalanceText(chart)),
    ],
    personality: [
      blk("p1", "Ядро личности", TX.PERS_CORE[sun]),
      blk("p2", "Как ты проявляешься", TX.MANIFEST_BY_ELEMENT[manifestEl]),
      blk("p3", "Внутренний ритм", TX.RHYTHM_BY_MODALITY[sunMod]),
      blk("p4", "Ключевой паттерн", TX.PATTERN_BY_MARS_ELEMENT[marsEl]),
    ],
    emotions: [
      blk("e1", "Что тебе нужно эмоционально", TX.EMO_NEED[moon]),
      blk("e2", "Что выводит из равновесия", TX.EMO_TRIGGER_BY_MOON_MODALITY[moonMod]),
      blk("e3", "Как ты восстанавливаешься", TX.EMO_RECOVERY_BY_MOON_ELEMENT[moonEl]),
      blk("e4", "Как включается защита", TX.EMO_DEFENSE_BY_MOON_ELEMENT[moonEl]),
    ],
    relationships: [
      blk("r1", "Как ты сближаешься", TX.REL_APPROACH_BY_VENUS_ELEMENT[venusEl]),
      blk("r2", "Что тебе важно в партнёре", TX.REL_PARTNER_BY_VENUS_ELEMENT[venusEl]),
      blk("r3", "Что может ранить", TX.REL_HURT_BY_MOON_ELEMENT[moonEl]),
      blk("r4", "Что помогает близости", TX.REL_CLOSENESS_BY_VENUS_ELEMENT[venusEl]),
    ],
    workAndMoney: [
      blk("w1", "Где ты раскрываешься", TX.WORK_SHINE_BY_SUN_ELEMENT[sunEl]),
      blk("w2", "Как ты работаешь", TX.WORK_STYLE_BY_SUN_MODALITY[sunMod]),
      blk("w3", "Что тебя мотивирует", TX.WORK_MOTIV_BY_MARS_ELEMENT[marsEl]),
      blk("w4", "Что может мешать", TX.WORK_BLOCK_BY_MARS_MODALITY[marsMod]),
      blk("w5", "Деньги и стабильность", TX.MONEY_BY_VENUS_ELEMENT[venusEl]),
    ],
    strengths: strengths.map((s, i) => blk(`s${i + 1}`, s.title, s.text)),
    growthZones: [
      { id: "g1", ...TX.GROWTH_BY_SUN_MODALITY[sunMod] },
      { id: "g2", ...TX.GROWTH2_BY_MOON_ELEMENT[moonEl] },
      { id: "g3", ...TX.GROWTH3_BY_WEAK_ELEMENT[chart.weakestElement] },
    ],
    recommendations: recs.map((r, i) => blk(`rc${i + 1}`, r.title, r.text)),
  };
}

function makeId(): string {
  return "r_" + Math.random().toString(36).slice(2, 9);
}

/** Async: geocodes the birth place and computes real planetary positions. */
export async function generateNatalReport(birthData: BirthData): Promise<NatalReport> {
  const chart = await computeChart(birthData);
  return {
    id: makeId(),
    birthData,
    chart,
    status: "short",
    isUnlocked: false,
    createdAt: new Date().toISOString(),
    shortReport: buildShortReport(birthData, chart),
    fullReport: buildFullReport(birthData, chart),
  };
}

/** Daily insight: varies by the sun element of the report and rotates by date. */
export function generateTodayInsight(report?: NatalReport | null): string {
  const fallback = TX.TODAY_BY_ELEMENT.water;
  const day = Math.floor(Date.now() / 86400000);
  if (!report?.chart) return fallback[day % fallback.length];
  const bank = TX.TODAY_BY_ELEMENT[elementOf(report.chart.sun.signIndex)];
  return bank[day % bank.length];
}
