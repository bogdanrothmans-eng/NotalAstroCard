import { verifyInitData } from "@/server/verifyInitData";
import { isReportPaid, paidReportIds } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/purchase-status?reportId=… — returns paid status from the DB
 * (the source of truth, not localStorage). Auth via `X-Telegram-Init-Data`.
 * Without reportId, returns all paid report ids so the client can reconcile.
 */
export async function GET(req: Request) {
  try {
    const initData = req.headers.get("x-telegram-init-data") ?? "";
    const { user } = verifyInitData(initData, process.env.BOT_TOKEN ?? "");

    const reportId = new URL(req.url).searchParams.get("reportId");
    if (reportId) {
      const paid = await isReportPaid(user.id, reportId);
      return Response.json({ paid });
    }
    return Response.json({ paidReportIds: await paidReportIds(user.id) });
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 401 });
  }
}
