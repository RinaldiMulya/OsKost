import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { decryptPaymentKey } from "@/lib/security/payment-crypto";
import logger from "@/lib/logger";

const log = logger.child({ module: "payment-service" });

// ============================================
// Konfigurasi Midtrans Dinamis Per Properti
// ============================================

export interface MidtransPropertyConfig {
  id?: string;
  isMidtransActive?: boolean | null;
  midtransServerKey?: string | null;
  midtransClientKey?: string | null;
}

/**
 * Mendapatkan konfigurasi Midtrans dinamis per properti kost.
 * Menggunakan kredensial terenkripsi AES-256-GCM milik owner (Direct Merchant),
 * atau fallback ke kredensial env server jika properti belum aktifkan Midtrans.
 */
export function getPropertyMidtransConfig(property?: MidtransPropertyConfig | null) {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
  const apiUrl = isProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

  if (property && property.isMidtransActive && property.midtransServerKey && property.id) {
    try {
      const decryptedServerKey = decryptPaymentKey(property.midtransServerKey, property.id);
      const authHeader = `Basic ${Buffer.from(decryptedServerKey + ":").toString("base64")}`;
      return {
        serverKey: decryptedServerKey,
        clientKey: property.midtransClientKey || null,
        authHeader,
        baseUrl,
        apiUrl,
        isCustomMerchant: true,
      };
    } catch (err) {
      log.error({ err, propertyId: property.id }, "Gagal mendekripsi midtransServerKey properti");
    }
  }

  // Fallback ke server env
  const fallbackServerKey = process.env.MIDTRANS_SERVER_KEY;
  if (!fallbackServerKey) {
    throw new Error("Metode pembayaran online (Midtrans) belum diaktifkan atau dikonfigurasi untuk kost ini.");
  }

  return {
    serverKey: fallbackServerKey,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || null,
    authHeader: `Basic ${Buffer.from(fallbackServerKey + ":").toString("base64")}`,
    baseUrl,
    apiUrl,
    isCustomMerchant: false,
  };
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
  // 1. Ambil invoice beserta data tenant dan properti
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      property: true,
      lease: {
        include: {
          property: true,
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

  const targetProperty = invoice.property || invoice.lease?.property;
  const midtransConfig = getPropertyMidtransConfig(targetProperty);

  const res = await fetch(`${midtransConfig.baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: midtransConfig.authHeader,
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

export interface ReconcileFilter {
  invoiceId?: string;
  userId?: string;
  propertyId?: string;
}

/**
 * Mengecek status invoice PENDING di Midtrans API
 * sebagai jaring pengaman jika webhook gagal terkirim atau pengujian lokal.
 */
export async function reconcilePendingInvoices(filter?: ReconcileFilter) {
  const whereClause: Record<string, unknown> = {
    status: "PENDING",
    provider: "MIDTRANS",
    OR: [
      { providerRef: { not: null } },
      { externalId: { not: null } },
    ],
  };

  if (filter?.invoiceId) {
    whereClause.id = filter.invoiceId;
  }
  if (filter?.userId) {
    whereClause.lease = { userId: filter.userId };
  }
  if (filter?.propertyId) {
    whereClause.propertyId = filter.propertyId;
  }

  const pendingInvoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      property: true,
      lease: {
        include: {
          property: true,
        },
      },
    },
  });

  let reconciled = 0;

  for (const invoice of pendingInvoices) {
    const targetProp = invoice.property || invoice.lease?.property;
    let midtransConfig;
    try {
      midtransConfig = getPropertyMidtransConfig(targetProp);
    } catch {
      continue;
    }

    try {
      const orderRef = invoice.providerRef || invoice.externalId;
      const res = await fetch(
        `${midtransConfig.apiUrl}/v2/${orderRef}/status`,
        {
          headers: {
            Authorization: midtransConfig.authHeader,
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
        const paidAtDate = data.settlement_time ? new Date(data.settlement_time) : new Date();
        const paymentMethod = data.payment_type ? data.payment_type.toUpperCase() : undefined;

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: nextStatus,
            paidAt: nextStatus === "PAID" ? paidAtDate : undefined,
            ...(paymentMethod ? { paymentMethod } : {}),
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
      room: { select: { price: true, propertyId: true } },
      invoices: {
        select: { id: true, externalId: true, propertyId: true, dueDate: true, rentAmount: true, utilityAmount: true, otherAmount: true, amount: true },
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

    const targetPropertyId = lease.propertyId || lease.room.propertyId;

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

      if (existingByPeriod && (!existingByPeriod.externalId || !existingByPeriod.propertyId)) {
        // Backfill externalId dan propertyId untuk invoice lama yang belum punya
        try {
          await prisma.invoice.update({
            where: { id: existingByPeriod.id },
            data: {
              ...(existingByPeriod.externalId ? {} : { externalId }),
              propertyId: targetPropertyId,
            },
          });
          backfilled++;
          existingIds.add(externalId);
          periodToInvoice.set(period, { ...existingByPeriod, externalId, propertyId: targetPropertyId });
          log.info({ leaseId: lease.id, period, externalId, propertyId: targetPropertyId }, "Backfill externalId/propertyId invoice lama");
        } catch (e: unknown) {
          log.error({ err: e, leaseId: lease.id, period }, "Gagal backfill externalId/propertyId");
        }
      } else if (!existingIds.has(externalId) && !existingByPeriod) {
        try {
          await prisma.invoice.create({
            data: {
              leaseId: lease.id,
              propertyId: targetPropertyId,
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
          log.info({ leaseId: lease.id, period, externalId, propertyId: targetPropertyId }, "Invoice bulanan dibuat");
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

/**
 * Membuat transaksi pembayaran Midtrans untuk seluruh tagihan akumulasi yang belum lunas.
 */
export async function createAccumulatedMidtransTransaction(
  userId: string,
  paymentMethodCode: string = "QRIS"
) {
  // 1. Ambil seluruh invoice UNPAID / OVERDUE dari tenant beserta data properti
  const invoices = await prisma.invoice.findMany({
    where: {
      lease: { userId },
      status: { in: ["UNPAID", "OVERDUE"] },
    },
    include: {
      property: true,
      lease: {
        include: {
          property: true,
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              tenantProfile: { select: { fullName: true } },
            },
          },
          room: { select: { number: true } },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  if (invoices.length === 0) {
    throw new Error("Tidak ada tagihan tertunggak yang perlu dibayar.");
  }

  // Cek apakah sudah ada transaksi aktif (PENDING) dengan token aktif di semua invoice
  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "PENDING" && inv.snapToken && inv.provider === "MIDTRANS"
  );
  if (pendingInvoices.length > 0 && pendingInvoices[0].snapToken) {
    const existingToken = pendingInvoices[0].snapToken;
    log.info({ userId, count: invoices.length }, "Mengembalikan transaksi akumulasi PENDING yang sudah ada");
    return {
      snapToken: existingToken,
      paymentUrl: pendingInvoices[0].paymentUrl,
      invoiceIds: invoices.map((inv) => inv.id),
      isAccumulated: true,
      invoicesCount: invoices.length,
    };
  }

  // 2. Ambil metode pembayaran
  let paymentMethod = await prisma.paymentMethod.findUnique({
    where: { methodCode: paymentMethodCode },
  });

  if (!paymentMethod || !paymentMethod.isActive) {
    paymentMethod = await prisma.paymentMethod.findFirst({
      where: { isActive: true },
    });
  }

  // 3. Hitung akumulasi
  const totalRent = invoices.reduce((sum, inv) => sum + inv.rentAmount, 0);
  const totalUtility = invoices.reduce((sum, inv) => sum + inv.utilityAmount, 0);
  const totalOther = invoices.reduce((sum, inv) => sum + inv.otherAmount, 0);
  const totalDiscounts = invoices.reduce((sum, inv) => sum + (inv.discountAmount || 0), 0);
  const baseAmount = totalRent + totalUtility + totalOther;

  let totalAdminFee = 0;
  let tenantAdminFee = 0;
  let ownerAdminFee = 0;

  if (paymentMethod) {
    if (paymentMethod.feeType === "FLAT") {
      totalAdminFee = paymentMethod.feeAmount;
    } else if (paymentMethod.feeType === "PERCENTAGE") {
      totalAdminFee = Math.ceil((baseAmount * paymentMethod.feeAmount) / 10000);
    }
    tenantAdminFee = Math.ceil((totalAdminFee * paymentMethod.tenantFeePercentage) / 100);
    ownerAdminFee = totalAdminFee - tenantAdminFee;
  }

  const grossAmount = Math.max(0, baseAmount + tenantAdminFee - totalDiscounts);
  if (grossAmount <= 0) {
    throw new Error("Total tagihan setelah diskon tidak valid (Rp 0 atau negatif).");
  }

  const firstInvoice = invoices[0];
  const lastInvoice = invoices[invoices.length - 1];
  const firstPeriod = new Date(firstInvoice.dueDate).toISOString().slice(0, 7);
  const lastPeriod = new Date(lastInvoice.dueDate).toISOString().slice(0, 7);
  const externalId = `INV-ACCUM-${firstInvoice.leaseId}-${firstPeriod}_${lastPeriod}`;
  const midtransOrderId = `${externalId}-${Date.now().toString(36)}`;

  const tenant = firstInvoice.lease.user;
  const tenantName = tenant.tenantProfile?.fullName || "Penghuni";
  const roomNumber = firstInvoice.lease.room.number;

  const itemDetails = invoices.map((inv) => {
    const periodLabel = new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(new Date(inv.dueDate));
    const subtotal = inv.rentAmount + inv.utilityAmount + inv.otherAmount;
    return {
      id: `INV_${inv.id.slice(0, 10)}`,
      price: subtotal,
      quantity: 1,
      name: `Sewa Kmr ${roomNumber} (${periodLabel})`.slice(0, 50),
    };
  });

  if (tenantAdminFee > 0) {
    itemDetails.push({
      id: "ADMIN_FEE",
      price: tenantAdminFee,
      quantity: 1,
      name: "Biaya Layanan",
    });
  }

  if (totalDiscounts > 0) {
    itemDetails.push({
      id: "DISKON",
      price: -totalDiscounts,
      quantity: 1,
      name: "Total Potongan",
    });
  }

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
    item_details: itemDetails,
  };

  log.info(
    { userId, count: invoices.length, midtransOrderId, grossAmount, paymentMethodCode },
    "Membuat transaksi akumulasi Midtrans"
  );

  const targetProperty = invoices[0].property || invoices[0].lease?.property;
  const midtransConfig = getPropertyMidtransConfig(targetProperty);

  const res = await fetch(`${midtransConfig.baseUrl}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: midtransConfig.authHeader,
    },
    body: JSON.stringify(midtransPayload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    log.error({ status: res.status, body: errBody, externalId }, "Midtrans API error");
    throw new Error("Gagal membuat transaksi pembayaran Midtrans.");
  }

  const { token, redirect_url } = await res.json();

  // Simpan snapToken dan midtransOrderId ke seluruh invoice yang tertunggak
  await prisma.$transaction(
    invoices.map((inv) =>
      prisma.invoice.update({
        where: { id: inv.id },
        data: {
          providerRef: midtransOrderId,
          status: "PENDING",
          provider: "MIDTRANS",
          snapToken: token,
          paymentUrl: redirect_url,
          paymentMethod: paymentMethod?.methodCode || paymentMethodCode,
        },
      })
    )
  );

  return {
    snapToken: token,
    paymentUrl: redirect_url,
    orderId: midtransOrderId,
    invoiceIds: invoices.map((inv) => inv.id),
    isAccumulated: true,
    invoicesCount: invoices.length,
    grossAmount,
  };
}

