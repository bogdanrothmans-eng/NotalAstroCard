import crypto from "node:crypto";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface VerifiedInitData {
  user: TelegramUser;
  authDate: number;
  raw: string;
}

/**
 * Verifies Telegram Mini App initData per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 *   secret_key = HMAC_SHA256(key="WebAppData", message=<bot_token>)
 *   hash       = HMAC_SHA256(key=secret_key,   message=data_check_string)
 *
 * Returns the verified user, or throws on any failure. NEVER trust the userId
 * from the client without this check.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
): VerifiedInitData {
  if (!initData) throw new Error("initData missing");
  if (!botToken) throw new Error("bot token not configured");

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new Error("initData has no hash");

  // Build the data-check-string: every field except `hash`, sorted by key.
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key === "hash") return;
    pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  // Constant-time comparison of the hex strings themselves. We compare the
  // strings (not Buffer.from(hash,"hex")) because hex decoding silently
  // truncates at the first invalid character, which would let a valid hash with
  // trailing garbage pass.
  const provided = hash.toLowerCase();
  const a = Buffer.from(computedHash, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("initData hash mismatch");
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate) throw new Error("initData has no auth_date");
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
  if (ageSeconds > maxAgeSeconds) throw new Error("initData expired");

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("initData has no user");
  let user: TelegramUser;
  try {
    user = JSON.parse(userRaw) as TelegramUser;
  } catch {
    throw new Error("initData user is not valid JSON");
  }
  if (!user?.id) throw new Error("initData user has no id");

  return { user, authDate, raw: initData };
}
