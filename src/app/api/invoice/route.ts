import { verifyInitData } from "@/server/verifyInitData";
import { upsertPendingPurchase } from "@/server/db";
import { createFullReportInvoiceLink } from "@/server/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/invoice — creates a Telegram Stars invoice link for a report.
 * Auth: verified Mini App initData passed in the `X-Telegram-Init-Data` header.
 * The userId comes from the verified initData, never from the client body.
 */
export async function POST(req: Request) {
  try {
    const initData = req.headers.get("x-telegram-init-data") ?? "";
    const body = (await req.json().catch(() => ({}))) as { reportId?: string };
    const reportId = body.reportId;
    if (!reportId) {
      return Response.json({ error: "reportId is required" }, { status: 400 });
    }

    const { user } = verifyInitData(initData, process.env.BOT_TOKEN ?? "");
    await upsertPendingPurchase(user.id, reportId);
    const invoiceLink = await createFullReportInvoiceLink(user.id, reportId);

    return Response.json({ invoiceLink });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 401 });
  }
}
