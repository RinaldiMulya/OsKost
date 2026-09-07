/**
 * Cron Job: Rekonsiliasi Invoice PENDING — GET /api/cron/reconcile-invoices
 *
 * Jaring pengaman terakhir: membandingkan status invoice PENDING
 * di database dengan status asli di server Midtrans.
 *
 * Dijalankan setiap malam via Vercel Cron / scheduled job.
 * Jika ditemukan ketidaksesuaian, status diperbarui dan alert di-log.
 */

import { NextResponse } from "next/server";
import { reconcilePendingInvoices } from "@/features/payment/payment-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "cron-reconcile" });

export async function GET() {
  try {
    log.info("Memulai rekonsiliasi invoice PENDING...");

    const result = await reconcilePendingInvoices();

    log.info(
      { checked: result.checked, reconciled: result.reconciled },
      "Rekonsiliasi selesai"
    );

    return NextResponse.json({
      message: "Rekonsiliasi selesai",
      checked: result.checked,
      reconciled: result.reconciled,
    });
  } catch (err) {
    log.error({ err }, "Error saat menjalankan rekonsiliasi");
    return NextResponse.json(
      { message: "Error saat rekonsiliasi", error: String(err) },
      { status: 500 }
    );
  }
}
