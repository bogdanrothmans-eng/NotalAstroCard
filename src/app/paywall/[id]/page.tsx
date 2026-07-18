"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/lib/useHydrated";
import { useNav } from "@/lib/nav";
import { T } from "@/lib/tokens";
import { Screen, BackSquare } from "@/components/ui";
import { ZodiacWheel } from "@/components/ui/ZodiacWheel";
import { EmptyState } from "@/components/ui/EmptyState";
import { confirmPaid, fetchPaidStatus, isInsideTelegram, openInvoice, requestInvoiceLink } from "@/lib/telegram";

const SLIDES: [string, string][] = [
  ["Личность", "Что у тебя в ядре и как это проявляется в характере"],
  ["Эмоции", "Что тебе важно, что выводит из равновесия и как ты восстанавливаешься"],
  ["Отношения", "Как ты сближаешься, чего ждём от партнёра и что может тебя ранить"],
  ["Работа", "Где ты раскрываешься, что мотивирует и как ты принимаешь решения"],
];

const STARS_PRICE = 150;

export default function PaywallPage() {
  const hydrated = useHydrated();
  const params = useParams<{ id: string }>();
  const { go, back } = useNav();
  const reports = useAppStore((s) => s.reports);
  const unlock = useAppStore((s) => s.unlock);

  const [slide, setSlide] = useState(2);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportId = params.id;

  // Reconcile with the backend: if this report was already paid for, unlock and
  // jump straight to the full version (DB is the source of truth, not localStorage).
  useEffect(() => {
    if (!hydrated || !reportId || !isInsideTelegram()) return;
    let cancelled = false;
    fetchPaidStatus(reportId).then((paid) => {
      if (paid && !cancelled) {
        unlock(reportId);
        go("full", { id: reportId });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, reportId, unlock, go]);

  if (!hydrated) return null;

  const report = reports.find((r) => r.id === params.id) || reports[0];
  if (!report) return <EmptyState />;

  // Real Telegram Stars flow: backend createInvoiceLink (XTR) → tg.openInvoice →
  // bot records successful_payment in the DB → we confirm against the DB → unlock.
  const pay = async () => {
    if (processing) return;
    setError(null);
    if (!isInsideTelegram()) {
      setError("Оплата доступна только внутри Telegram");
      return;
    }
    setProcessing(true);
    try {
      const link = await requestInvoiceLink(report.id);
      const status = await openInvoice(link);
      if (status === "paid") {
        const ok = await confirmPaid(report.id);
        if (ok) {
          unlock(report.id);
          go("full", { id: report.id });
          return;
        }
        setError("Платёж обрабатывается. Загляни в раздел чуть позже.");
      } else if (status === "failed") {
        setError("Не удалось провести платёж. Попробуй ещё раз.");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Screen>
      <div style={{ marginBottom: 16 }}>
        <BackSquare onClick={back} />
      </div>

      {/* hero card: illustration on top, caption below, dots under */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
        <div style={{ width: "100%", background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ borderRadius: 8, overflow: "hidden" }}>
            <ZodiacWheel h={189} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 500 }}>{SLIDES[slide][0]}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.4 }}>{SLIDES[slide][1]}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 8 : 6,
                height: i === slide ? 8 : 6,
                borderRadius: "50%",
                cursor: "pointer",
                background: i === slide ? T.white : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      <h1 style={{ color: T.textPrimary, fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.12px", margin: "24px 0 0" }}>
        Откройте полный разбор натальной карты
      </h1>
      <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.3, letterSpacing: "0.12px", margin: "8px 0 24px" }}>
        Мы уже рассчитали карту. В полном отчёте покажем, как она проявляется в характере, эмоциях, отношениях, работе и
        личных решениях
      </p>

      {/* Single payment method — Telegram Stars (XTR). Card/СБП is not allowed for
          digital goods inside a Telegram Mini App. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
        <div
          onClick={processing ? undefined : pay}
          style={{
            background: T.surface,
            borderRadius: 16,
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 72, background: "#282828", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500 }}>Telegram Stars</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>Мгновенно, прямо в Telegram</div>
            </div>
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
            {processing ? (
              <RefreshCw size={16} color="rgba(255,255,255,0.6)" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {STARS_PRICE} <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
              </span>
            )}
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center" }}>Один платёж. Без подписки.</div>
        {error && <div style={{ color: T.error, fontSize: 13, textAlign: "center", marginTop: 4 }}>{error}</div>}
      </div>
    </Screen>
  );
}
