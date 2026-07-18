import { webhookCallback } from "grammy";
import { bot } from "@/server/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook — receives Telegram updates (pre_checkout_query,
 * successful_payment, …). grammY verifies the secret token against the
 * `X-Telegram-Bot-Api-Secret-Token` header that we set during setWebhook.
 */
const handle = webhookCallback(bot, "std/http", {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
});

export async function POST(req: Request) {
  return handle(req);
}
