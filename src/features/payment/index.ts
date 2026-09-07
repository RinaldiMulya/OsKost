/**
 * Payment Feature — Public API (Client & Actions)
 *
 * Catatan: JANGAN export service layer (import "server-only") di sini
 * agar Client Component dapat mengimpor komponen UI & Server Actions tanpa
 * memicu error bundler bundler/SSR.
 */

// Server Actions ("use server")
export {
  createPaymentAction,
  applyDiscountAction,
  removeDiscountAction,
  cancelPaymentAction,
} from "./actions";

export {
  submitPromoClaimAction,
  approvePromoClaimAction,
  rejectPromoClaimAction,
} from "./promo-actions";

// Schemas
export {
  createPaymentSchema,
  applyDiscountSchema,
  midtransNotificationSchema,
} from "./payment-schema";

// Client UI Components
export { PaymentSelector } from "./components/payment-selector";
export { AdminDiscountDialog } from "./components/admin-discount-dialog";
export { BillingPaymentToggle } from "./components/billing-payment-toggle";
export { PromoClaimDialog } from "./components/promo-claim-dialog";
export { SnapPendingHandler } from "./components/snap-pending-handler";
