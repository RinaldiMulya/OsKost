"use client";

import { useState, ReactNode } from "react";
import { CreditCard, Landmark } from "lucide-react";

interface BillingPaymentToggleProps {
  onlinePaymentContent: ReactNode;
  manualPaymentContent: ReactNode;
}

/**
 * Toggle Switch Mode Pembayaran untuk PWA Tenant Billing.
 *
 * Memisahkan secara bersih antara:
 * 1. "Pembayaran Online (Midtrans)" -> Hanya menampilkan PaymentSelector (VA, QRIS, dll), form manual disembunyikan.
 * 2. "Transfer Manual / Onsite" -> Menampilkan petunjuk rekening & form upload bukti transfer, opsi online disembunyikan.
 */
export function BillingPaymentToggle({
  onlinePaymentContent,
  manualPaymentContent,
}: BillingPaymentToggleProps) {
  const [activeMode, setActiveMode] = useState<"ONLINE" | "MANUAL">("ONLINE");

  return (
    <div className="space-y-4">
      {/* Toggle Bar */}
      <div className="grid grid-cols-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveMode("ONLINE")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
            activeMode === "ONLINE"
              ? "bg-secondary text-white shadow-md shadow-secondary/20"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Pembayaran Online</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode("MANUAL")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 ${
            activeMode === "MANUAL"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-700"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Transfer Manual / Onsite</span>
        </button>
      </div>

      {/* Mode Content */}
      <div className="transition-all duration-200">
        {activeMode === "ONLINE" ? onlinePaymentContent : manualPaymentContent}
      </div>
    </div>
  );
}
