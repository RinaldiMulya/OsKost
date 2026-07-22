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
import { markInvoicePaidAction } from "../actions";
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

  let contractBadgeColor = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  if (hasActiveLease) {
    if (daysLeft < 0) {
      // Kontrak sudah habis tapi belum dicheckout
      contractBadgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
    } else if (daysLeft <= 30) {
      contractBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    } else {
      contractBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  }

  // === Status Pembayaran Dinamis (Bulan) ===
  let paymentText = "—";
  let paymentColor = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  let paymentDotColor = "bg-zinc-500";

  if (hasActiveLease) {
    if (hasUnpaid) {
      // Ambil bulan dari tagihan tertunggak paling lama
      const oldestUnpaid = unpaidInvoices[0];
      const monthLabel = formatShortMonth(oldestUnpaid.dueDate);
      paymentText = `Unpaid (${monthLabel})`;
      paymentColor = "bg-red-500/10 text-red-400 border-red-500/20";
      paymentDotColor = "bg-red-400";
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
      paymentColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      paymentDotColor = "bg-emerald-400";
    }
  } else if (tenant.leases.length > 0) {
    paymentText = "—";
    paymentColor = "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    paymentDotColor = "bg-zinc-400";
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

  function handleSendReminder() {
    toast.success(
      `Reminder pembayaran berhasil dikirim ke ${name} (WhatsApp)!`,
    );
  }

  return (
    <>
      {/* MAIN ROW */}
      <TableRow
        onClick={() => setIsExpanded(!isExpanded)}
        className={`border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors select-none ${
          isExpanded ? "bg-zinc-800/20" : ""
        }`}
      >
        <TableCell className="text-center w-12">
          {isExpanded ? (
            <ChevronUp className="size-4 text-zinc-400" />
          ) : (
            <ChevronDown className="size-4 text-zinc-400" />
          )}
        </TableCell>
        <TableCell className="py-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300 font-bold text-lg">
              {initials || <User className="size-4 text-zinc-400" />}
            </div>
            <div>
              <p className="font-semibold text-lg text-zinc-100">{name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-md text-zinc-500">
                <span className="font-mono">
                  T-{tenant.id.slice(-6).toUpperCase()}
                </span>
                {tenant.phoneNumber && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3 text-zinc-500" />
                      {tenant.phoneNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-zinc-200 font-medium text-md">
          {roomNumber}
        </TableCell>
        <TableCell className="text-zinc-400 text-md">{checkInDate}</TableCell>
        <TableCell>
          {hasActiveLease ? (
            <Badge
              variant="outline"
              className={`font-semibold text-md ${contractBadgeColor}`}
            >
              {remainingContract}
            </Badge>
          ) : tenant.leases.length > 0 ? (
            <Badge
              variant="outline"
              className="font-semibold text-md bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            >
              Checked-out
            </Badge>
          ) : (
            <span className="text-zinc-600">—</span>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={`gap-1.5 px-2.5 py-1 text-md ${paymentColor}`}
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
            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-8 gap-2"
          >
            <Link href={`/admin/tenants/${tenant.id}`}>
              <Eye className="size-3.5" /> Lihat Detail
            </Link>
          </Button>
        </TableCell>
      </TableRow>

      {/* EXPANDED PANEL */}
      {isExpanded && (
        <TableRow className="bg-zinc-950/60 border-zinc-800 hover:bg-transparent">
          <TableCell colSpan={7} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-zinc-900/40 rounded-xl p-6 border border-zinc-800/60 animate-in fade-in duration-300">
              {/* Panel 1: Kontak & Asal */}
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-xl text-zinc-400 flex items-center gap-2 border-b border-zinc-400 pb-2">
                  <Phone className="size-4 text-zinc-500" /> Kontak & Asal
                </h4>
                <div className="text-lg text-zinc-300 space-y-2">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 block">
                      Nomor HP Penghuni
                    </span>
                    <span className="font-mono text-zinc-200 font-medium">
                      {tenant.phoneNumber ?? "—"}
                    </span>
                  </p>
                  {tenant.email && (
                    <p className="flex items-center justify-between gap-2">
                      <span className="text-zinc-500 block">
                        Email
                      </span>
                      <span className="text-zinc-200 text-md truncate max-w-[180px]">
                        {tenant.email}
                      </span>
                    </p>
                  )}
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 block">
                      Nama Kontak Darurat
                    </span>
                    <span className="font-medium text-zinc-200">
                      {tenant.tenantProfile?.emergencyContactName ?? "—"}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 block">
                      Nomor Kontak Darurat
                    </span>
                    <span className="font-mono text-zinc-200">
                      {tenant.tenantProfile?.emergencyContactNumber ?? "—"}
                    </span>
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 block">Alamat Asal KTP</span>
                    <AddressField
                      address={tenant.tenantProfile?.address ?? undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Panel 2: Contract Info */}
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-lg text-zinc-400 flex items-center gap-2 border-b border-zinc-400 pb-2">
                  <FileText className="size-4 text-zinc-500" /> Detail Kontrak
                </h4>
                <div className="text-xs text-zinc-300 space-y-2">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500 text-lg block">
                      Durasi Sewa
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-200 mt-0.5">
                      <Calendar className="size-4 text-zinc-500" />
                      <span className="text-lg">
                        {activeLease
                          ? `${formatDate(activeLease.startDate)} s/d ${formatDate(activeLease.endDate)}`
                          : "—"}
                      </span>
                    </span>
                  </p>

                </div>
                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-zinc-400/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-zinc-800 text-zinc-300 hover:text-white bg-transparent hover:bg-zinc-800 text-xs w-full"
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
                      className="h-8 border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 bg-transparent text-xs w-full gap-1"
                    >
                      <Bell className="size-3.5" /> Kirim Tagihan
                    </Button>
                  )}
                </div>
              </div>

              {/* Panel 3: Billing & Invoices */}
              <div className="flex flex-col gap-4 bg-zinc-900/80 rounded-lg p-4 border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-semibold text-sm flex items-center gap-2 ${
                      hasUnpaid ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    <ReceiptIcon className="size-4" /> Tagihan Aktif
                  </h4>
                  {hasUnpaid ? (
                    <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold tracking-wider uppercase border border-red-500/30">
                      Belum Bayar
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
                      Lunas
                    </Badge>
                  )}
                </div>

                {hasUnpaid ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="text-xs space-y-1.5 my-2">
                      <p className="text-zinc-400">
                        Periode Tagihan:{" "}
                        <span className="font-semibold text-zinc-100">
                          {formatPeriodDate(unpaidInvoices[0].dueDate)}
                        </span>
                      </p>
                      <p className="text-zinc-400">
                        Total Tunggakan:{" "}
                        <span className="text-red-400 font-bold text-base block mt-0.5">
                          {formatRupiah(totalUnpaidAmount)}
                        </span>
                      </p>
                      <p className="text-red-400/90 font-semibold flex items-center gap-1 mt-2 text-[11px]">
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-9 text-xs transition-all active:scale-[0.98] gap-1.5 shadow-sm mt-3"
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
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Check className="size-8 text-emerald-400 mb-2 p-1 bg-emerald-500/10 rounded-full border border-emerald-500/20" />
                    <p className="text-xs font-semibold text-zinc-300">
                      Semua Tagihan Lunas
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 mr-28 max-w-[180px]">
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
