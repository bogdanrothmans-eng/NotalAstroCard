/**
 * Registers (or clears) the Telegram webhook for the payment bot.
 *
 *   npm run set-webhook              # uses WEBHOOK_URL or PUBLIC_BASE_URL/api/telegram/webhook
 *   npm run set-webhook -- --delete  # removes the webhook
 *
 * Reads env from .env.local / .env (loaded via tsx --env-file or your shell).
 */
const token = process.env.BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

async function main() {
  if (!token) throw new Error("BOT_TOKEN is not set");

  const del = process.argv.includes("--delete");
  if (del) {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: "POST" });
    console.log("deleteWebhook:", await res.json());
    return;
  }

  const base = process.env.WEBHOOK_URL
    ? process.env.WEBHOOK_URL
    : `${(process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "")}/api/telegram/webhook`;
  if (!base || base.startsWith("/api")) {
    throw new Error("Set WEBHOOK_URL or PUBLIC_BASE_URL (e.g. https://your-app.vercel.app)");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: base,
      secret_token: secret || undefined,
      allowed_updates: ["message", "pre_checkout_query"],
    }),
  });
  console.log("setWebhook:", await res.json());
  console.log("→", base);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
