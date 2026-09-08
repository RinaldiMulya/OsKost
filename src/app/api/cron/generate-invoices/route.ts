/**
 * Cron Job: Generate Invoice Bulanan — GET /api/cron/generate-invoices
 *
 * Membuat invoice bulanan untuk semua lease aktif yang belum punya
 * invoice di periode tersebut. Idempoten via externalId.
 * Dijalankan tiap tanggal 1 jam 02:00 WIB via Vercel Cron.
 */

import { NextResponse } from "next/server";
import { generateMonthlyInvoices } from "@/features/payment/payment-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "cron-generate-invoices" });

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    log.info("Memulai generate invoice bulanan...");
    const result = await generateMonthlyInvoices();
    log.info(result, "Generate invoice bulanan selesai");

    return NextResponse.json({
      message: "Generate invoice bulanan selesai",
      ...result,
    });
  } catch (err) {
    log.error({ err }, "Error saat generate invoice bulanan");
    return NextResponse.json({ message: "Error", error: String(err) }, { status: 500 });
  }
}
