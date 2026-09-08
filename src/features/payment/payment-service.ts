import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import logger from "@/lib/logger";

const log = logger.child({ module: "payment-service" });

// ============================================
// Konfigurasi Midtrans
// ============================================

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? "https://api.midtrans.com"
  : "https://api.sandbox.midtrans.com";

/**
 * Helper: Encode server key ke Base64 untuk Authorization header Midtrans
 */
function getMidtransAuthHeader(): string {
  return `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`;
}

// ============================================
// Queries (Cached)
// ============================================

/**
 * Ambil daftar metode pembayaran aktif (QRIS, VA, dll)
 */
export const getActivePaymentMethods = cache(async () => {
  return unstable_cache(
    async () => {
      return prisma.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: { methodName: "asc" },
      });
    },
    ["active-payment-methods"],
    { tags: [CACHE_TAGS.PAYMENT_METHODS], revalidate: 3600 }
  )();
});

/**
 * Ambil daftar preset diskon aktif (Google Review, Early Bird, dll)
 */
export const getActiveDiscountPresets = cache(async () => {
  return unstable_cache(
    async () => {
      return prisma.discountPreset.findMany({
        where: { isActive: true },
        orderBy: { label: "asc" },
      });
    },
    ["active-discount-presets"],
    { tags: [CACHE_TAGS.DISCOUNT_PRESETS], revalidate: 3600 }
  )();
});

// ============================================
// Mutations: Membuat Transaksi Midtrans
// ============================================

/**
 * Membuat transaksi pembayaran via Midtrans Snap.
 *
 * Alur:
 * 1. Ambil data invoice dari DB → hitung ulang amount (JANGAN percaya client)
 * 2. Hitung admin fee berdasarkan metode pembayaran terpilih
 * 3. Cek idempotensi (externalId deterministik)
 * 4. Request Snap token ke Midtrans API
 * 5. Simpan/update invoice dengan snapToken & status PENDING
 */
export async function createMidtransTransaction(
  invoiceId: string,
  paymentMethodCode: string
) {
  // 1. Ambil invoice beserta data tenant
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lease: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
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

  if (!invoice) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  // Cek apakah tagihan sudah lunas
  if (invoice.status === "PAID") {
    throw new Error("Tagihan periode ini sudah lunas.");
  }

  // Cek apakah sudah ada transaksi aktif (PENDING) dengan snap token
  if (invoice.status === "PENDING" && invoice.snapToken && invoice.provider === "MIDTRANS") {
    // Kembalikan transaksi yang sudah ada — idempotent
    log.info({ invoiceId }, "Mengembalikan transaksi PENDING yang sudah ada");
    return {
      snapToken: invoice.snapToken,
      paymentUrl: invoice.paymentUrl,
      invoiceId: invoice.id,
    };
  }

  // 2. Ambil konfigurasi metode pembayaran
  const paymentMethod = await prisma.paymentMethod.findUnique({
    where: { methodCode: paymentMethodCode },
  });

  if (!paymentMethod || !paymentMethod.isActive) {
    throw new Error("Metode pembayaran tidak tersedia.");
  }

  // 3. Hitung admin fee berdasarkan metode
  const baseAmount = invoice.rentAmount + invoice.utilityAmount + invoice.otherAmount;

  let totalAdminFee = 0;
  if (paymentMethod.feeType === "FLAT") {
    totalAdminFee = paymentMethod.feeAmount; // Misal: 4000
  } else if (paymentMethod.feeType === "PERCENTAGE") {
    // feeAmount dalam basis poin: 30 = 0.3%, 70 = 0.7%
    totalAdminFee = Math.ceil((baseAmount * paymentMethod.feeAmount) / 10000);
  }

  const tenantAdminFee = Math.ceil(
    (totalAdminFee * paymentMethod.tenantFeePercentage) / 100
  );
  const ownerAdminFee = totalAdminFee - tenantAdminFee;

  // Hitung diskon (jika sudah diset admin sebelumnya)
  const discountAmount = invoice.discountAmount || 0;

  // Total yang dikirim ke Midtrans
  const grossAmount = Math.max(0, baseAmount + tenantAdminFee - discountAmount);

  if (grossAmount <= 0) {
    throw new Error("Total tagihan setelah diskon tidak valid (Rp 0 atau negatif).");
  }

  // 4. Generate externalId deterministik untuk idempotensi, dan midtransOrderId unik per attempt
  const billingPeriod = new Date(invoice.dueDate).toISOString().slice(0, 7); // "2026-08"
  const externalId = `INV-${invoice.leaseId}-${billingPeriod}`;
  const midtransOrderId = `${externalId}-${Date.now().toString(36)}`;

  // 5. Request Snap token ke Midtrans
  const tenant = invoice.lease.user;
  const tenantName = tenant.tenantProfile?.fullName || "Penghuni";

  log.info(
    { invoiceId, externalId, midtransOrderId, grossAmount, paymentMethodCode },
    "Membuat transaksi Midtrans dengan order_id unik"
  );

  const midtransPayload = {
    transaction_details: {
      order_id: midtransOrderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: tenantName,
      email: tenant.email || undefined,
      phone: tenant.phoneNumber || undefined,
    },
    item_details: [
      {
        id: "SEWA_KAMAR",
        price: invoice.rentAmount,
        quantity: 1,
        name: `Sewa Kamar ${invoice.lease.room.number}`,
      },
      ...(invoice.utilityAmount > 0
        ? [
            {
              id: "UTILITAS",
              price: invoice.utilityAmount,
              quantity: 1,
              name: "Listrik & Air",
            },
          ]
        : []),
      ...(invoice.otherAmount > 0
        ? [
            {
              id: "LAINNYA",
              price: invoice.otherAmount,
              quantity: 1,
              name: "Sampah & Keamanan",
            },
          ]
        : []),
      ...(tenantAdminFee > 0
        ? [
            {
              id: "ADMIN_FEE",
              price: tenantAdminFee,
              quantity: 1,
              name: "Biaya Layanan",
            },
          ]
        : []),
      ...(discountAmount > 0
        ? [
            {
              id: "DISKON",
              price: -discountAmount,
              quantity: 1,
              name: `Potongan: ${invoice.discountReason || "Diskon"}`,
            },
          ]
        : []),
    ],
  };

  const res = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getMidtransAuthHeader(),
    },
    body: JSON.stringify(midtransPayload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    log.error(
      { status: res.status, body: errBody, externalId },
      "Midtrans API error"
    );
    throw new Error(`Gagal membuat transaksi pembayaran. Silakan coba lagi.`);
  }

  const { token, redirect_url } = await res.json();

  // 6. Update invoice dengan data transaksi
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      externalId,
      providerRef: midtransOrderId,
      amount: grossAmount,
      totalAdminFee,
      tenantAdminFee,
      ownerAdminFee,
      status: "PENDING",
      provider: "MIDTRANS",
      snapToken: token,
      paymentUrl: redirect_url,
    },
  });

  log.info({ invoiceId, externalId, midtransOrderId, token }, "Transaksi Midtrans berhasil dibuat");

  return {
    snapToken: token,
    paymentUrl: redirect_url,
    invoiceId,
  };
}

// ============================================
// Mutations: Terapkan Diskon dari Admin
// ============================================

/**
 * Admin menerapkan diskon preset ke invoice tertentu.
 * Diskon hanya bisa diterapkan sebelum tenant melakukan pembayaran (status UNPAID/OVERDUE).
 */
export async function applyDiscountToInvoice(
  invoiceId: string,
  discountPresetCode: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  if (invoice.status === "PAID" || invoice.status === "PENDING") {
    throw new Error(
      "Diskon tidak bisa diterapkan. Tagihan sudah lunas atau sedang dalam proses pembayaran."
    );
  }

  // Ambil preset diskon
  const preset = await prisma.discountPreset.findUnique({
    where: { code: discountPresetCode },
  });

  if (!preset || !preset.isActive) {
    throw new Error("Preset diskon tidak ditemukan atau tidak aktif.");
  }

  let discountAmount = 0;

  if (preset.type === "FIXED") {
    discountAmount = preset.amount;
  } else if (preset.type === "ADMIN_FEE_WAIVER") {
    // Pembebasan biaya admin → akan dihitung saat createMidtransTransaction
    // Untuk sementara set flag saja
    discountAmount = 0; // Akan dihitung dinamis saat checkout
  }

  // Pastikan diskon tidak melebihi total tagihan dasar
  const baseAmount = invoice.rentAmount + invoice.utilityAmount + invoice.otherAmount;
  discountAmount = Math.min(discountAmount, baseAmount);

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      discountAmount,
      discountReason: preset.code,
    },
  });
}

/**
 * Hapus diskon dari invoice (admin membatalkan promo)
 */
export async function removeDiscountFromInvoice(invoiceId: string) {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      discountAmount: 0,
      discountReason: null,
    },
  });
}

// ============================================
// Webhook: Proses notifikasi dari Midtrans
// ============================================

/**
 * Mapping status transaksi Midtrans ke PaymentStatus OsKost.
 */
export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): "PENDING" | "PAID" | "FAILED" | "EXPIRED" {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "PENDING" : "PAID";
    case "settlement":
      return "PAID";
    case "pending":
      return "PENDING";
    case "deny":
    case "cancel":
      return "FAILED";
    case "expire":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}

// ============================================
// Cron: Rekonsiliasi invoice PENDING
// ============================================

/**
 * Mengecek status invoice PENDING di Midtrans API
 * sebagai jaring pengaman jika webhook gagal terkirim.
 */
export async function reconcilePendingInvoices() {
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      status: "PENDING",
      provider: "MIDTRANS",
      externalId: { not: null },
    },
  });

  let reconciled = 0;

  for (const invoice of pendingInvoices) {
    try {
      const res = await fetch(
        `${MIDTRANS_API_URL}/v2/${invoice.externalId}/status`,
        {
          headers: {
            Authorization: getMidtransAuthHeader(),
          },
        }
      );

      if (!res.ok) {
        log.warn(
          { externalId: invoice.externalId, status: res.status },
          "Gagal cek status Midtrans saat rekonsiliasi"
        );
        continue;
      }

      const data = await res.json();
      const nextStatus = mapMidtransStatus(
        data.transaction_status,
        data.fraud_status
      );

      if (nextStatus !== "PENDING" && nextStatus !== invoice.status) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: nextStatus,
            providerRef: data.transaction_id,
            paidAt: nextStatus === "PAID" ? new Date() : undefined,
          },
        });

        log.warn(
          { externalId: invoice.externalId, from: invoice.status, to: nextStatus },
          "Invoice diperbarui via rekonsiliasi — webhook sebelumnya gagal terkirim"
        );
        reconciled++;
      }
    } catch (err) {
      log.error(
        { err, externalId: invoice.externalId },
        "Error saat rekonsiliasi invoice"
      );
    }
  }

  return { checked: pendingInvoices.length, reconciled };
}

// ============================================
// Cron: Generate invoice bulanan
// ============================================

/**
 * Generate invoice bulanan untuk semua lease aktif.
 * Idempoten via externalId = INV-{leaseId}-{YYYY-MM}.
 * Backfill otomatis: jika ada bulan terlewat, dibuat sekaligus.
 */
export async function generateMonthlyInvoices() {
  const now = new Date();
  const toPeriod = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const addMonths = (d: Date, m: number) => {
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + m);
    return nd;
  };

  const leases = await prisma.lease.findMany({
    where: { isActive: true },
    include: {
      room: { select: { price: true } },
      invoices: {
        select: { id: true, externalId: true, dueDate: true, rentAmount: true, utilityAmount: true, otherAmount: true, amount: true },
      },
    },
  });

  let created = 0;
  let skipped = 0;
  let backfilled = 0;

  for (const lease of leases) {
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : now;
    const effectiveEnd = end < now ? end : now;

    const lastInv = lease.invoices[lease.invoices.length - 1];
    const rentAmt = lastInv?.rentAmount ?? lease.room.price ?? 0;
    const utilAmt = lastInv?.utilityAmount ?? 0;
    const otherAmt = lastInv?.otherAmount ?? 0;
    const totalAmount = lastInv?.amount ?? rentAmt + utilAmt + otherAmt;

    const existingIds = new Set(lease.invoices.map((i) => i.externalId).filter(Boolean) as string[]);
    // Map periode YYYY-MM -> invoice (untuk backfill externalId null)
    const periodToInvoice = new Map<string, (typeof lease.invoices)[number]>();
    for (const inv of lease.invoices) {
      const p = toPeriod(new Date(inv.dueDate));
      if (!periodToInvoice.has(p)) periodToInvoice.set(p, inv);
      if (inv.externalId) existingIds.add(inv.externalId);
    }

    let idx = 0;
    let cur = new Date(start);
    while (cur <= effectiveEnd) {
      const period = toPeriod(cur);
      const externalId = `INV-${lease.id}-${period}`;
      const existingByPeriod = periodToInvoice.get(period);

      if (existingByPeriod && !existingByPeriod.externalId) {
        // Backfill externalId untuk invoice lama yang belum punya
        try {
          await prisma.invoice.update({
            where: { id: existingByPeriod.id },
            data: { externalId },
          });
          backfilled++;
          existingIds.add(externalId);
          periodToInvoice.set(period, { ...existingByPeriod, externalId });
          log.info({ leaseId: lease.id, period, externalId }, "Backfill externalId invoice lama");
        } catch (e: unknown) {
          log.error({ err: e, leaseId: lease.id, period }, "Gagal backfill externalId");
        }
      } else if (!existingIds.has(externalId) && !existingByPeriod) {
        try {
          await prisma.invoice.create({
            data: {
              leaseId: lease.id,
              dueDate: new Date(cur),
              amount: totalAmount,
              rentAmount: rentAmt,
              utilityAmount: utilAmt,
              otherAmount: otherAmt,
              status: "UNPAID",
              externalId,
            },
          });
          created++;
          existingIds.add(externalId);
          log.info({ leaseId: lease.id, period, externalId }, "Invoice bulanan dibuat");
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("Unique") || msg.includes("unique")) skipped++;
          else log.error({ err: e, leaseId: lease.id, period }, "Gagal buat invoice bulanan");
        }
      } else {
        skipped++;
      }
      idx++;
      cur = addMonths(start, idx);
      if (idx > 36) break;
    }
  }

  return { checked: leases.length, created, skipped, backfilled };
}
