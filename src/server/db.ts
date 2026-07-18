import { createClient, type Client } from "@libsql/client";

/**
 * libSQL (SQLite) data layer. Works against a local file in dev
 * (TURSO_DATABASE_URL="file:./local.db") and hosted Turso in production
 * (libsql://… + TURSO_AUTH_TOKEN), so the same code runs on Vercel serverless.
 *
 * The reports themselves stay in the client (localStorage); the server is the
 * source of truth ONLY for paid/unlock status, keyed by (telegram_user_id, report_id).
 */
let _client: Client | null = null;
let _schemaReady: Promise<void> | null = null;

function client(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  _client = createClient({ url, authToken });
  return _client;
}

async function ensureSchema(): Promise<void> {
  if (_schemaReady) return _schemaReady;
  _schemaReady = client()
    .execute(`
      CREATE TABLE IF NOT EXISTS purchases (
        telegram_user_id INTEGER NOT NULL,
        report_id        TEXT    NOT NULL,
        status           TEXT    NOT NULL DEFAULT 'pending',
        charge_id        TEXT,
        amount           INTEGER,
        currency         TEXT,
        created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at       TEXT    NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (telegram_user_id, report_id)
      );
    `)
    .then(() => undefined);
  return _schemaReady;
}

/** Record (or refresh) a pending purchase before the invoice is opened. */
export async function upsertPendingPurchase(userId: number, reportId: string): Promise<void> {
  await ensureSchema();
  await client().execute({
    sql: `
      INSERT INTO purchases (telegram_user_id, report_id, status)
      VALUES (?, ?, 'pending')
      ON CONFLICT (telegram_user_id, report_id) DO UPDATE SET
        status     = CASE WHEN purchases.status = 'paid' THEN 'paid' ELSE 'pending' END,
        updated_at = datetime('now');
    `,
    args: [userId, reportId],
  });
}

/** Mark a purchase paid on successful_payment. Idempotent. */
export async function markPurchasePaid(
  userId: number,
  reportId: string,
  chargeId: string,
  amount: number,
  currency: string,
): Promise<void> {
  await ensureSchema();
  await client().execute({
    sql: `
      INSERT INTO purchases (telegram_user_id, report_id, status, charge_id, amount, currency)
      VALUES (?, ?, 'paid', ?, ?, ?)
      ON CONFLICT (telegram_user_id, report_id) DO UPDATE SET
        status     = 'paid',
        charge_id  = excluded.charge_id,
        amount     = excluded.amount,
        currency   = excluded.currency,
        updated_at = datetime('now');
    `,
    args: [userId, reportId, chargeId, amount, currency],
  });
}

/** Whether (user, report) has a paid purchase. */
export async function isReportPaid(userId: number, reportId: string): Promise<boolean> {
  await ensureSchema();
  const res = await client().execute({
    sql: `SELECT status FROM purchases WHERE telegram_user_id = ? AND report_id = ? LIMIT 1;`,
    args: [userId, reportId],
  });
  return res.rows[0]?.status === "paid";
}

/** All paid report ids for a user — lets the client reconcile unlock status. */
export async function paidReportIds(userId: number): Promise<string[]> {
  await ensureSchema();
  const res = await client().execute({
    sql: `SELECT report_id FROM purchases WHERE telegram_user_id = ? AND status = 'paid';`,
    args: [userId],
  });
  return res.rows.map((r) => String(r.report_id));
}
