"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/lib/useHydrated";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { Screen } from "@/components/ui";

const LOADING_LINES = [
  "Ищем, где у тебя спрятан внутренний двигатель",
  "Меркурий не ретроградный, просто думаем",
  "Собираем карту без хрустального шара. Почти...",
];

export default function LoadingPage() {
  const hydrated = useHydrated();
  const { go, reset } = useNav();
  const reports = useAppStore((s) => s.reports);
  const lastOpenedReportId = useAppStore((s) => s.lastOpenedReportId);
  const [idx, setIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const report = reports.find((r) => r.id === lastOpenedReportId) || reports[0];

  // No report to build (e.g. refresh on /loading) → bounce home.
  useEffect(() => {
    if (hydrated && !report) reset("main");
  }, [hydrated, report, reset]);

  useEffect(() => {
    const t1 = setInterval(() => setIdx((i) => (i + 1) % LOADING_LINES.length), 1500);
    const t2 = setTimeout(() => {
      if (report) go("short", { id: report.id });
    }, 5000);
    return () => {
      clearInterval(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const SIZE = 380;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    const cx = SIZE / 2,
      cy = SIZE / 2;

    const N = 34;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));
    const particles = Array.from({ length: N }, (_, i) => {
      const baseR = 72 + (i / (N - 1)) * 108 + (Math.random() - 0.5) * 16;
      return {
        angle: i * GOLDEN + (Math.random() - 0.5) * 0.4,
        baseR,
        speed: 0.4 + Math.random() * 0.55,
        size: 0.8 + Math.random() * 3.0,
        wob: Math.random() * Math.PI * 2,
        alpha: 0.4 + Math.random() * 0.5,
      };
    });

    const DURATION = 5000,
      DRAIN_START = 3200;
    let start: number | null = null,
      last: number | null = null,
      raf = 0;
    const tick = (ts: number) => {
      if (start == null) {
        start = ts;
        last = ts;
      }
      const t = ts - start;
      let dt = (ts - (last ?? ts)) / 1000;
      last = ts;
      if (dt > 0.05) dt = 0.05;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const drainRaw = t <= DRAIN_START ? 0 : Math.min(1, (t - DRAIN_START) / (DURATION - DRAIN_START));
      const ease = drainRaw * drainRaw * (3 - 2 * drainRaw);

      particles.forEach((p) => {
        const angSpeed = p.speed * (1 + ease * 6);
        p.angle += angSpeed * dt;
        const rr = p.baseR * (1 - ease) + Math.sin(ts / 650 + p.wob) * 4 * (1 - ease);
        const x = cx + Math.cos(p.angle) * rr;
        const y = cy + Math.sin(p.angle) * rr;
        const fade = Math.min(1, rr / 38);
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * fade})`;
        ctx.shadowColor = "rgba(255,255,255,0.7)";
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (t < DURATION) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Screen>
      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 360, aspectRatio: "1", margin: "0 auto" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div style={{ marginTop: 24, textAlign: "center", padding: "0 24px" }}>
          <div style={{ color: T.textPrimary, fontSize: 19, fontWeight: 700 }}>Строим твою натальную карту</div>
          <div
            key={idx}
            style={{ color: T.textSecondary, fontSize: 14, marginTop: 10, maxWidth: 260, marginLeft: "auto", marginRight: "auto", animation: "fadeIn .6s ease" }}
          >
            {LOADING_LINES[idx]}
          </div>
        </div>
      </div>
    </Screen>
  );
}
