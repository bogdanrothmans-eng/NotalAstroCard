import { Bot } from "grammy";
import { markPurchasePaid } from "./db";

/**
 * grammY bot for Telegram Stars payments. Shared by the webhook route handler
 * (src/app/api/telegram/webhook) and the invoice route (for createInvoiceLink).
 *
 * Digital goods inside a Mini App must be sold via Telegram Stars only:
 *   currency = "XTR", provider_token = "" (empty).
 */
export const FULL_REPORT_PRICE_STARS = 150;

const token = process.env.BOT_TOKEN;
if (!token) {
  // Don't crash module import in environments without the token (e.g. build);
  // routes will surface a clear error at request time.
  console.warn("[bot] BOT_TOKEN is not set — payment routes will fail until configured.");
}

export const bot = new Bot(token ?? "missing-token");

/** Encode/decode the invoice payload that ties a payment to (user, report). */
export function encodePayload(userId: number, reportId: string): string {
  return `${userId}:${reportId}`;
}
export function decodePayload(payload: string): { userId: number; reportId: string } | null {
  const idx = payload.indexOf(":");
  if (idx === -1) return null;
  const userId = Number(payload.slice(0, idx));
  const reportId = payload.slice(idx + 1);
  if (!userId || !reportId) return null;
  return { userId, reportId };
}

// Approve every pre-checkout for our own invoices (must answer within 10s).
bot.on("pre_checkout_query", async (ctx) => {
  const ok = decodePayload(ctx.preCheckoutQuery.invoice_payload) !== null;
  await ctx.answerPreCheckoutQuery(ok, ok ? undefined : "Некорректный платёж");
});

// Record the successful payment as the source of truth (in the DB, not localStorage).
bot.on("message:successful_payment", async (ctx) => {
  const sp = ctx.message.successful_payment;
  const decoded = decodePayload(sp.invoice_payload);
  if (!decoded) return;
  await markPurchasePaid(
    decoded.userId,
    decoded.reportId,
    sp.telegram_payment_charge_id,
    sp.total_amount,
    sp.currency,
  );
});

/** Create a one-time Stars invoice link for unlocking a report's full version. */
export async function createFullReportInvoiceLink(userId: number, reportId: string): Promise<string> {
  return bot.api.createInvoiceLink(
    "Полный разбор натальной карты",
    "Полная натальная карта: личность, эмоции, отношения, работа, сильные стороны, зоны роста и персональные рекомендации.",
    encodePayload(userId, reportId),
    "", // provider_token MUST be empty for Telegram Stars (XTR)
    "XTR",
    [{ label: "Полный разбор", amount: FULL_REPORT_PRICE_STARS }],
  );
}
