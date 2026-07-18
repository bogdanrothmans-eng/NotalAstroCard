/* End-to-end engine test with live geocoding. Run: npx tsx scripts/_test-engine.ts */
import { generateNatalReport } from "../src/lib/astro/realNatalEngine";
import { SIGNS } from "../src/lib/astro/chart";
import type { BirthData } from "../src/types";

const cases: BirthData[] = [
  { name: "Аня", gender: null, birthDate: "15.05.1995", birthTime: "08:30", birthTimeAccuracy: "exact", birthPlace: "Московская обл., Пушкино" },
  { name: "Игорь", gender: null, birthDate: "02.12.1988", birthTime: "", birthTimeAccuracy: "approximate", approximatePeriod: "evening", birthPlace: "Санкт-Петербург" },
  { name: "Оля", gender: null, birthDate: "21.08.2001", birthTime: "", birthTimeAccuracy: "unknown", birthPlace: "Алматы" },
  { name: "Тест", gender: null, birthDate: "10.01.1990", birthTime: "12:00", birthTimeAccuracy: "exact", birthPlace: "явно несуществующее место 12345" },
];

async function main() {
for (const b of cases) {
  const r = await generateNatalReport(b);
  const c = r.chart!;
  console.log(`\n=== ${b.name} (${b.birthDate} ${b.birthTimeAccuracy}) @ "${b.birthPlace}"`);
  console.log(`place → ${c.placeResolved ? c.placeLabel : "NOT RESOLVED (fallback)"} | utc=${c.utc}`);
  console.log(`sun=${SIGNS[c.sun.signIndex]} moon=${SIGNS[c.moon.signIndex]} asc=${c.ascendant ? SIGNS[c.ascendant.signIndex] : "—"}`);
  console.log(`elements=${JSON.stringify(c.elements)} dom=${c.dominantElement} weak=${c.weakestElement}`);
  console.log(`short blocks: ${r.shortReport.blocks.map((x) => x.title).join(" | ")}`);
  const sections = Object.entries(r.fullReport).map(([k, v]) => `${k}:${v.length}`).join(" ");
  console.log(`full sections: ${sections}`);
  // sanity: no undefined/empty texts anywhere
  const bad: string[] = [];
  for (const blk of r.shortReport.blocks) if (!blk.title || !blk.text) bad.push("short:" + blk.id);
  for (const [k, v] of Object.entries(r.fullReport))
    for (const blk of v) if (!blk.title || !blk.text || blk.text.includes("undefined")) bad.push(`${k}:${blk.id}`);
  console.log(bad.length ? `BAD BLOCKS: ${bad.join(",")}` : "all blocks OK");
}
}
main();
