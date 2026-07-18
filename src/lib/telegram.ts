"use client";

/** Client helpers for the Telegram Mini App payment flow. */

export type InvoiceStatus = "paid" | "cancelled" | "failed" | "pending";

export function getWebApp() {
  if (typeof window === "undefined") return undefined;
  return window.Telegram?.WebApp;
}

export function getInitData(): string {
  return getWebApp()?.initData ?? "";
}

export function isInsideTelegram(): boolean {
  return getInitData().length > 0;
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Telegram-Init-Data": getInitData(),
  };
}

/** Ask the backend to create a Telegram Stars invoice link for this report. */
export async function requestInvoiceLink(reportId: string): Promise<string> {
  const res = await fetch("/api/invoice", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ reportId }),
  });
  const data = (await res.json().catch(() => ({}))) as { invoiceLink?: string; error?: string };
  if (!res.ok || !data.invoiceLink) throw new Error(data.error || "Не удалось создать счёт");
  return data.invoiceLink;
}

/** Open the native Telegram invoice and resolve with its final status. */
export function openInvoice(link: string): Promise<InvoiceStatus> {
  return new Promise((resolve) => {
    const tg = getWebApp();
    if (!tg?.openInvoice) {
      resolve("failed");
      return;
    }
    tg.openInvoice(link, (status) => resolve(status));
  });
}

/** Read paid status for one report from the backend (DB = source of truth). */
export async function fetchPaidStatus(reportId: string): Promise<boolean> {
  const res = await fetch(`/api/purchase-status?reportId=${encodeURIComponent(reportId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return false;
  const data = (await res.json().catch(() => ({}))) as { paid?: boolean };
  return data.paid === true;
}

/**
 * The Mini App can learn a payment succeeded before our webhook records it.
 * Poll the backend a few times so we only unlock once the DB confirms.
 */
export async function confirmPaid(reportId: string, attempts = 6, delayMs = 800): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    if (await fetchPaidStatus(reportId)) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}
