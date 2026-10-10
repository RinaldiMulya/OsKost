"use client";

import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Phone,
  ShieldAlert,
  FileText,
  Bell,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Check,
  Loader2,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { markInvoicePaidAction, sendBillingReminderAction } from "../actions";
import { toast } from "sonner";
import Link from "next/link";
import { Eye } from "lucide-react";
import { CheckoutTenantButton } from "./checkout-tenant-button";

interface TenantRowProps {
  tenant: {
    id: string;
    email: string | null;
    phoneNumber: string | null;
    createdAt: Date;
    tenantProfile: {
      fullName: string;
      ktpNumber: string | null;
      ktpPhotoUrl: string | null;
      address: string | null;
      emergencyContactName: string | null;
      emergencyContactNumber: string | null;
    } | null;
    leases: any[];
  };
}

export function TenantRow({ tenant }: TenantRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const name = tenant.tenantProfile?.fullName ?? "—";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Active Lease calculations
  const activeLease = tenant.leases.find((l) => l.isActive);
  const hasActiveLease = !!activeLease;
  const roomNumber = activeLease?.room?.number
    ? `Room ${activeLease.room.number}`
    : "—";
  const checkInDate = activeLease ? formatDate(activeLease.startDate) : "—";
  const remainingContract = activeLease
    ? getRemainingContract(activeLease.endDate, activeLease.isActive)
    : "—";

  // Invoices calculations
  const activeInvoices = activeLease?.invoices ?? [];
  const unpaidInvoices = activeInvoices.filter(
    (inv: any) => inv.status === "UNPAID" || inv.status === "OVERDUE",
  );
  const totalUnpaidAmount = unpaidInvoices.reduce(
    (sum: number, inv: any) => sum + inv.amount,
    0,
  );
  const hasUnpaid = unpaidInvoices.length > 0;

  // === Status Kontrak / Sewa ===
  const daysLeft = activeLease?.endDate
    ? getDaysRemaining(activeLease.endDate)
    : 999;

  let contractBadgeColor = "bg-[#F2EDE9] text-[#4A453F] border-[#2C2825]/15";
  if (hasActiveLease) {
    if (daysLeft < 0) {
      // Kontrak sudah habis tapi belum dicheckout
      contractBadgeColor = "bg-red-50 text-red-800 border-red-300";
    } else if (daysLeft <= 30) {
      contractBadgeColor = "bg-amber-50 text-amber-800 border-amber-300";
    } else {
      contractBadgeColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
    }
  }

  // === Status Pembayaran Dinamis (Bulan) ===
  let paymentText = "—";
  let paymentColor = "bg-[#F2EDE9] text-[#4A453F] border-[#2C2825]/15";
  let paymentDotColor = "bg-[#4A453F]";

  if (hasActiveLease) {
    if (hasUnpaid) {
      // Ambil bulan dari tagihan tertunggak paling lama
      const oldestUnpaid = unpaidInvoices[0];
      const monthLabel = formatShortMonth(oldestUnpaid.dueDate);
      paymentText = `Unpaid (${monthLabel})`;
      paymentColor = "bg-red-50 text-red-800 border-red-300";
      paymentDotColor = "bg-red-600";
    } else {
      // Cari invoice terakhir yang sudah PAID
      const paidInvoices = activeInvoices.filter(
        (inv: any) => inv.status === "PAID",
      );
      if (paidInvoices.length > 0) {
        // Invoice terakhir yang dibayar (sorted asc by dueDate, ambil terakhir)
        const lastPaid = paidInvoices[paidInvoices.length - 1];
        const monthLabel = formatShortMonth(lastPaid.dueDate);
        paymentText = `Paid (${monthLabel})`;
      } else {
        paymentText = "Paid";
      }
      paymentColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
      paymentDotColor = "bg-emerald-600";
    }
  } else if (tenant.leases.length > 0) {
    paymentText = "—";
    paymentColor = "bg-[#F2EDE9] text-[#4A453F] border-[#2C2825]/15";
    paymentDotColor = "bg-[#82756A]";
  }

  async function handleMarkPaid(invoiceId: string) {
    setLoadingInvoiceId(invoiceId);
    const result = await markInvoicePaidAction(invoiceId);
    setLoadingInvoiceId(null);
    if (result.success) {
      toast.success("Pembayaran berhasil ditandai lunas!");
    } else {
      toast.error(result.error ?? "Gagal menandai lunas.");
    }
  }

  async function handleSendReminder() {
    setIsSendingReminder(true);
    const result = await sendBillingReminderAction(tenant.id);
    setIsSendingReminder(false);
    if (result.success) {
      toast.success(
        `Reminder tagihan berhasil dikirim ke ${result.tenantName ?? name}!`,
      );
    } else {
      toast.error(result.error ?? "Gagal mengirim reminder tagihan.");
    }
  }

  return (
    <>
      {/* MAIN ROW */}
      <TableRow
        onClick={() => setIsExpanded(!isExpanded)}
        className={`border-b border-[#2C2825]/8 hover:bg-[#F8F6F1]/70 cursor-pointer transition-colors select-none ${
          isExpanded ? "bg-[#FAF2EA]/60" : ""
        }`}
      >
        <TableCell className="text-center w-12">
          {isExpanded ? (
            <ChevronUp className="size-4 text-[#4A453F]" />
          ) : (
            <ChevronDown className="size-4 text-[#4A453F]" />
          )}
        </TableCell>
        <TableCell className="py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#FAF2EA] border border-[#714A23]/25 flex items-center justify-center text-[#714A23] font-bold text-sm">
              {initials || <User className="size-4 text-[#714A23]" />}
            </div>
            <div>
              <p className="font-bold text-base text-[#1E1B18]">{name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-[#5C564E]">
                <span className="font-mono">
                  T-{tenant.id.slice(-6).toUpperCase()}
                </span>
                {tenant.phoneNumber && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3 text-[#5C564E]" />
                      {tenant.phoneNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-[#1E1B18] font-bold text-sm">
          {roomNumber}
        </TableCell>
        <TableCell className="text-[#4A453F] font-semibold text-sm">{checkInDate}</TableCell>
        <TableCell>
          {hasActiveLease ? (
            <Badge
              variant="outline"
              className={`font-bold text-xs rounded-full px-2.5 py-1 ${contractBadgeColor}`}
            >
              {remainingContract}
            </Badge>
          ) : tenant.leases.length > 0 ? (
            <Badge
              variant="outline"
              className="font-bold text-xs bg-[#F2EDE9] text-[#4A453F] border-[#2C2825]/15 rounded-full px-2.5 py-1"
            >
              Checked-out
            </Badge>
          ) : (
            <span className="text-[#82756A]">—</span>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={`gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${paymentColor}`}
          >
            <span className={`size-1.5 rounded-full ${paymentDotColor}`} />
            {paymentText}
          </Badge>
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-[#2C2825]/15 text-[#1E1B18] hover:text-[#1E1B18] hover:bg-[#F2EDE9] h-8 text-xs font-semibold gap-1.5 rounded-lg"
          >
            <Link href={`/admin/tenants/${tenant.id}`}>
              <Eye className="size-3.5" /> Lihat Detail
            </Link>
          </Button>
        </TableCell>
      </TableRow>

      {/* EXPANDED PANEL */}
      {isExpanded && (
        <TableRow className="bg-[#F8F6F1]/50 border-b border-[#2C2825]/10 hover:bg-[#F8F6F1]/50">
          <TableCell colSpan={7} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white rounded-2xl p-6 border border-[#2C2825]/10 shadow-sm animate-in fade-in duration-300">
              {/* Panel 1: Kontak & Asal */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-base text-[#1E1B18] flex items-center gap-2 border-b border-[#2C2825]/10 pb-2">
                  <Phone className="size-4 text-[#714A23]" /> Kontak & Asal
                </h4>
                <div className="text-sm text-[#4A453F] space-y-2.5">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-[#5C564E] font-medium block">
                      Nomor HP Penghuni
                    </span>
                    <span className="font-mono text-[#1E1B18] font-bold">
                      {tenant.phoneNumber ?? "—"}
                    </span>
                  </p>
                  {tenant.email && (
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-[#5C564E] font-medium block">
                        Email
                      </span>
                      <span className="text-[#1E1B18] font-semibold truncate max-w-[180px]">
                        {tenant.email}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-[#5C564E] font-medium block">
                      Nama Kontak Darurat
                    </span>
                    <span className="font-bold text-[#1E1B18]">
                      {tenant.tenantProfile?.emergencyContactName ?? "—"}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-[#5C564E] font-medium block">
                      Nomor Kontak Darurat
                    </span>
                    <span className="font-mono text-[#1E1B18] font-bold">
                      {tenant.tenantProfile?.emergencyContactNumber ?? "—"}
                    </span>
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#5C564E] font-medium block">Alamat Asal KTP</span>
                    <AddressField
                      address={tenant.tenantProfile?.address ?? undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Panel 2: Contract Info */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-base text-[#1E1B18] flex items-center gap-2 border-b border-[#2C2825]/10 pb-2">
                  <FileText className="size-4 text-[#714A23]" /> Detail Kontrak
                </h4>
                <div className="text-sm text-[#4A453F] space-y-2.5">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-[#5C564E] font-medium block">
                      Durasi Sewa
                    </span>
                    <span className="flex items-center gap-1.5 text-[#1E1B18] font-bold">
                      <Calendar className="size-4 text-[#714A23]" />
                      <span>
                        {activeLease
                          ? `${formatDate(activeLease.startDate)} s/d ${formatDate(activeLease.endDate)}`
                          : "—"}
                      </span>
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 mt-auto pt-4 border-t border-[#2C2825]/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-[#2C2825]/15 text-[#1E1B18] hover:bg-[#F2EDE9] text-xs font-semibold w-full rounded-xl"
                    asChild
                  >
                    <Link href={`/admin/tenants/${tenant.id}/edit`}>
                      Edit Data
                    </Link>
                  </Button>
                  {hasActiveLease && (
                    <CheckoutTenantButton
                      userId={tenant.id}
                      tenantName={name}
                      variant="full"
                    />
                  )}
                  {hasUnpaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendReminder}
                      disabled={isSendingReminder}
                      className="h-9 border-amber-300 text-amber-800 hover:bg-amber-50 bg-amber-50/50 text-xs font-bold w-full gap-1.5 rounded-xl"
                    >
                      {isSendingReminder ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Bell className="size-3.5" />
                      )}
                      {isSendingReminder ? "Mengirim..." : "Kirim Tagihan"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Panel 3: Billing & Invoices */}
              <div className="flex flex-col gap-4 bg-[#FAF2EA]/50 rounded-xl p-5 border border-[#2C2825]/10">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-bold text-sm flex items-center gap-2 ${
                      hasUnpaid ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    <ReceiptIcon className="size-4" /> Tagihan Aktif
                  </h4>
                  {hasUnpaid ? (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-bold tracking-wider uppercase border border-red-300 rounded-full px-2.5 py-0.5">
                      Belum Bayar
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs font-bold tracking-wider uppercase border border-emerald-300 rounded-full px-2.5 py-0.5">
                      Lunas
                    </Badge>
                  )}
                </div>

                {hasUnpaid ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-xs space-y-1.5 my-2">
                      <p className="text-[#4A453F] font-medium">
                        Periode Tagihan:{" "}
                        <span className="font-bold text-[#1E1B18]">
                          {formatPeriodDate(unpaidInvoices[0].dueDate)}
                        </span>
                      </p>
                      <p className="text-[#4A453F] font-medium">
                        Total Tunggakan:{" "}
                        <span className="text-red-700 font-extrabold text-lg block mt-0.5">
                          {formatRupiah(totalUnpaidAmount)}
                        </span>
                      </p>
                      <p className="text-red-700 font-bold flex items-center gap-1 mt-2 text-xs">
                        <Clock className="size-3.5 shrink-0" />
                        <span>
                          Jatuh tempo pada{" "}
                          {formatDate(unpaidInvoices[0].dueDate)}
                        </span>
                      </p>
                    </div>

                    <Button
                      onClick={() => handleMarkPaid(unpaidInvoices[0].id)}
                      disabled={loadingInvoiceId !== null}
                      className="w-full bg-[#2C4C3B] hover:bg-[#1E3428] text-white font-bold h-9 text-xs transition-all active:scale-[0.98] gap-1.5 shadow-sm mt-3 rounded-xl"
                    >
                      {loadingInvoiceId === unpaidInvoices[0].id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="size-3.5" />
                      )}
                      {loadingInvoiceId === unpaidInvoices[0].id
                        ? "Memproses..."
                        : "Tandai Lunas"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <Check className="size-9 text-emerald-700 mb-2 p-1.5 bg-emerald-100 rounded-full border border-emerald-300" />
                    <p className="text-sm font-bold text-[#1E1B18]">
                      Semua Tagihan Lunas
                    </p>
                    <p className="text-xs font-medium text-[#4A453F] mt-1 max-w-[200px]">
                      Tidak ada tagihan tertunggak untuk masa sewa aktif ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ============================================
// Helper Functions
// ============================================

function AddressField({ address }: { address?: string }) {
  const [expanded, setExpanded] = useState(false);

  const MAX_LENGTH = 80;
  const fullAddress = address ?? "—";
  const isLong = fullAddress.length > MAX_LENGTH;

  const displayedAddress =
    expanded || !isLong
      ? fullAddress
      : `${fullAddress.slice(0, MAX_LENGTH)}...`;

  return (
    <div className="text-right">
      <span className="text-zinc-200">{displayedAddress}</span>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="block ml-auto mt-1 text-sm text-primary hover:underline"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8H8" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  );
}

function formatDate(dateStr: Date | string | null | undefined) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatPeriodDate(dateStr: Date | string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysRemaining(endDateStr: Date | string) {
  const endDate = new Date(endDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getRemainingContract(
  endDateStr: Date | string | null | undefined,
  isActive: boolean,
) {
  if (!isActive || !endDateStr) return "—";

  const daysLeft = getDaysRemaining(endDateStr);

  // Kontrak sudah lewat tanggal selesai
  if (daysLeft < 0) {
    return `Lewat ${Math.abs(daysLeft)} Hari`;
  }

  if (daysLeft === 0) return "Hari Ini";

  if (daysLeft <= 30) {
    return `${daysLeft} Hari`;
  }

  const diffMonths = Math.round(daysLeft / 30);
  return `${diffMonths} Bulan`;
}

/**
 * Format nama bulan singkat dari tanggal (misal: "Jul", "Agu", "Sep")
 */
function formatShortMonth(dateStr: Date | string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date);
}
