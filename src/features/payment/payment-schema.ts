/**
 * Payment Schema — Validasi Zod untuk Payment Gateway OsKost
 *
 * Mendefinisikan skema validasi untuk:
 * 1. Input pembuatan transaksi dari tenant
 * 2. Payload webhook Midtrans
 * 3. Input diskon/promo dari admin
 */
import { z } from "zod";

// ============================================
// Input: Pembuatan Transaksi oleh Tenant
// ============================================

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID wajib diisi"),
  paymentMethodCode: z.string().min(1, "Metode pembayaran wajib dipilih"),
});

// ============================================
// Input: Penerapan Diskon oleh Admin
// ============================================

export const applyDiscountSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID wajib diisi"),
  discountPresetCode: z.string().min(1, "Pilih jenis diskon"),
});

// ============================================
// Webhook: Payload Notifikasi Midtrans
// ============================================

export const midtransNotificationSchema = z.object({
  order_id: z.string(),
  status_code: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string().optional(),
  transaction_id: z.string(),
  payment_type: z.string().optional(),
});
