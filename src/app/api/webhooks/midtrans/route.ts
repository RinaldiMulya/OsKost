/**
 * Midtrans Webhook Handler — POST /api/webhooks/midtrans
 *
 * Endpoint ini menerima notifikasi HTTP dari server Midtrans.
 * Alur keamanan:
 * 1. Log payload mentah SEBELUM diproses (audit trail)
 * 2. Validasi skema Zod
 * 3. Verifikasi signature SHA-512
 * 4. Update status invoice secara idempotent dalam transaksi DB
 * 5. Kirim notifikasi ke tenant jika pembayaran sukses
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { midtransNotificationSchema } from "@/features/payment/payment-schema";
import { mapMidtransStatus } from "@/features/payment/payment-service";
import { sendNotification } from "@/features/notifications/notification-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "webhook-midtrans" });

export async function POST(req: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Body tidak valid" },
      { status: 400 }
    );
  }

  // 1. Catat payload mentah SEBELUM diproses — jejak forensik
  const webhookLog = await prisma.webhookLog.create({
    data: {
      provider: "MIDTRANS",
      rawPayload: rawBody as object,
      signatureValid: false,
    },
  });

  // 2. Validasi skema payload
  const parsed = midtransNotificationSchema.safeParse(rawBody);
  if (!parsed.success) {
    log.warn(
      { logId: webhookLog.id, errors: parsed.error.issues },
      "Payload webhook Midtrans tidak valid"
    );
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { httpStatusSent: 400 },
    });
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const payload = parsed.data;

  // 3. Verifikasi signature SHA-512
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    log.error("MIDTRANS_SERVER_KEY tidak dikonfigurasi di environment");
    return NextResponse.json(
      { message: "Konfigurasi server error" },
      { status: 500 }
    );
  }

  const expectedSignature = crypto
    .createHash("sha512")
    .update(
      payload.order_id +
        payload.status_code +
        payload.gross_amount +
        serverKey
    )
    .digest("hex");

  if (expectedSignature !== payload.signature_key) {
    log.warn(
      { logId: webhookLog.id, orderId: payload.order_id },
      "Signature webhook Midtrans TIDAK VALID — kemungkinan serangan"
    );
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { httpStatusSent: 403 },
    });
    return NextResponse.json(
      { message: "Signature tidak valid" },
      { status: 403 }
    );
  }

  // Signature valid — update log
  await prisma.webhookLog.update({
    where: { id: webhookLog.id },
    data: { signatureValid: true },
  });

  // 4. Update status invoice secara idempotent dalam transaksi database
  try {
    await prisma.$transaction(async (tx) => {
      // Parsing externalId asli dengan membuang suffix timestamp jika ada
      const baseExternalId = payload.order_id.split("-").slice(0, 4).join("-");

      const matchingInvoices = await tx.invoice.findMany({
        where: {
          OR: [
            { providerRef: payload.order_id },
            { externalId: baseExternalId },
          ],
        },
        select: {
          id: true,
          status: true,
          lease: {
            select: {
              userId: true,
              user: {
                select: {
                  tenantProfile: {
                    select: { fullName: true },
                  },
                },
              },
              room: {
                select: { number: true },
              },
            },
          },
        },
      });

      if (matchingInvoices.length === 0) {
        log.warn(
          { orderId: payload.order_id, baseExternalId },
          "Invoice tidak ditemukan untuk order_id dari webhook"
        );
        return;
      }

      // Idempotency: jika seluruhnya sudah PAID, abaikan
      const unpaidMatching = matchingInvoices.filter((inv) => inv.status !== "PAID");
      if (unpaidMatching.length === 0) {
        log.info(
          { orderId: payload.order_id },
          "Invoice sudah PAID — webhook duplikat, diabaikan"
        );
        return;
      }

      const invoice = matchingInvoices[0];
      const nextStatus = mapMidtransStatus(
        payload.transaction_status,
        payload.fraud_status
      );

      await tx.invoice.updateMany({
        where: { id: { in: unpaidMatching.map((inv) => inv.id) } },
        data: {
          status: nextStatus,
          providerRef: payload.transaction_id,
          paidAt: nextStatus === "PAID" ? new Date() : undefined,
        },
      });

      // Update referensi webhook log ke invoice
      await tx.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          invoiceId: invoice.id,
          httpStatusSent: 200,
        },
      });

      // Kirim notifikasi ke tenant jika pembayaran berhasil
      if (nextStatus === "PAID") {
        const tenantName =
          invoice.lease.user.tenantProfile?.fullName || "Penghuni";
        const roomNumber = invoice.lease.room.number;

        // Notifikasi ke tenant (async, non-blocking)
        sendNotification({
          userId: invoice.lease.userId,
          title: "Pembayaran Berhasil! ✅",
          message: `Pembayaran sewa Kamar ${roomNumber} telah dikonfirmasi otomatis.`,
          type: "BILLING",
          url: "/dashboard/billing",
        }).catch((err) =>
          log.error({ err }, "Gagal kirim notifikasi PAID ke tenant")
        );

        // Notifikasi ke semua admin
        const admins = await tx.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        });

        for (const admin of admins) {
          sendNotification({
            userId: admin.id,
            title: "Pembayaran Masuk 💰",
            message: `${tenantName} (Kamar ${roomNumber}) telah melunasi tagihan via Midtrans.`,
            type: "BILLING",
            url: "/admin/tenants",
          }).catch((err) =>
            log.error({ err }, "Gagal kirim notifikasi PAID ke admin")
          );
        }

        // Invalidate cache
        updateTag(CACHE_TAGS.tenantDashboard(invoice.lease.userId));
        updateTag(CACHE_TAGS.tenantInvoices(invoice.lease.userId));
        updateTag(CACHE_TAGS.DASHBOARD_STATS);
        updateTag(CACHE_TAGS.ADMIN_TENANTS);
      }

      // Kirim notifikasi jika expired
      if (nextStatus === "EXPIRED") {
        sendNotification({
          userId: invoice.lease.userId,
          title: "Pembayaran Kedaluwarsa ⏰",
          message: `Batas waktu pembayaran telah habis. Silakan buat ulang transaksi pembayaran.`,
          type: "BILLING",
          url: "/dashboard/billing",
        }).catch((err) =>
          log.error({ err }, "Gagal kirim notifikasi EXPIRED ke tenant")
        );

        // Invalidate cache
        updateTag(CACHE_TAGS.tenantDashboard(invoice.lease.userId));
        updateTag(CACHE_TAGS.tenantInvoices(invoice.lease.userId));
      }
    });
  } catch (err) {
    log.error(
      { err, orderId: payload.order_id },
      "Error saat memproses webhook Midtrans"
    );
    // Tetap balas 200 agar Midtrans tidak re-send terus-menerus
    // Error sudah ter-log di WebhookLog dan console
  }

  // 5. Selalu balas cepat — Midtrans akan re-send jika response lambat/timeout
  return NextResponse.json({ message: "OK" }, { status: 200 });
}
