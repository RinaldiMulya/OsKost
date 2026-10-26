"use client";

import { useState } from "react";
import Image from "next/image";
import { markInvoicePaidAction } from "../../actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CheckCircle2,
  CircleX,
  Receipt,
  Image as ImageIcon,
  Loader2,
  Bell,
  FileWarning,
  Eye,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { AdminDiscountDialog } from "@/features/payment";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TenantDetailForAdmin } from "../../tenant-service";
import {
  rejectInvoicePaymentAction,
  sendBillingReminderAction,
} from "../../actions";

interface TenantBillingTabProps {
  tenant: TenantDetailForAdmin;
}

export function TenantBillingTab({ tenant }: TenantBillingTabProps) {
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Ambil semua invoice dari lease aktif
  const activeLease = tenant.leases.find((l) => l.isActive);
  const allInvoices = tenant.leases
    .flatMap((l) => l.invoices)
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    );

  const activeInvoices = activeLease?.invoices ?? [];
  const unpaidInvoices = activeInvoices.filter(
    (inv) =>
      inv.status === "UNPAID" ||
      inv.status === "PENDING" ||
      inv.status === "OVERDUE",
  );
  const hasUnpaid = unpaidInvoices.length > 0;

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateStr: Date | string | null) {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  }

  function formatPeriod(dateStr: Date | string) {
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  }

  async function handleMarkPaid(invoiceId: string) {
    setLoadingInvoiceId(invoiceId);
    const result = await markInvoicePaidAction(invoiceId);
    setLoadingInvoiceId(null);
    if (result.success) {
      toast.success("Pembayaran berhasil diverifikasi lunas!");
      setPreviewImage(null);
    } else {
      toast.error(result.error ?? "Gagal menandai lunas.");
    }
  }

  async function handleRejectPaid(invoiceId: string) {
    if (!rejectReason) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    setLoadingInvoiceId(invoiceId);
    const result = await rejectInvoicePaymentAction(invoiceId, rejectReason);
    setLoadingInvoiceId(null);
    if (result.success) {
      toast.success("Pembayaran berhasil ditolak!");
      setPreviewImage(null);
      setShowRejectForm(false);
      setRejectReason("");
    } else {
      toast.error(result.error ?? "Gagal menolak pembayaran.");
    }
  }

  async function handleSendReminder() {
    setIsSendingReminder(true);
    const userId = tenant.id;
    const result = await sendBillingReminderAction(userId);
    setIsSendingReminder(false);
    if (result.success) {
      toast.success(
        `Reminder tagihan berhasil dikirim ke ${result.tenantName ?? "penghuni"}!`,
      );
    } else {
      toast.error(result.error ?? "Gagal mengirim reminder tagihan.");
    }
  }

  return (
    <div className="space-y-6">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TAGIHAN AKTIF / TUNGGAKAN BANNER */}
      {/* ────────────────────────────────────────────────────────── */}
      {hasUnpaid ? (
        <Card className="border-rose-200/80 bg-rose-50/40 shadow-xs rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-rose-200/60 bg-rose-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-rose-900 flex items-center gap-2">
                  <FileWarning className="size-5 text-rose-600" />
                  <span>
                    Menunggu Pelunasan / Verifikasi ({unpaidInvoices.length}{" "}
                    Tagihan)
                  </span>
                </CardTitle>
                <CardDescription className="text-rose-800/80 text-xs mt-1">
                  Tagihan berikut belum lunas atau memiliki bukti bayar manual
                  yang perlu ditinjau.
                </CardDescription>
              </div>
              <Button
                onClick={handleSendReminder}
                disabled={isSendingReminder}
                variant="outline"
                size="sm"
                className="border-rose-300 text-rose-800 hover:bg-rose-100 bg-white/80 rounded-xl text-xs gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                {isSendingReminder ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Bell className="size-3.5" />
                )}
                <span>
                  {isSendingReminder ? "Mengirim..." : "Kirim Pengingat"}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {unpaidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-white rounded-xl p-5 border border-rose-200/90 shadow-xs flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold tracking-wider uppercase rounded-bl-lg border-l border-b border-rose-200">
                    {invoice.status}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#7A7269] uppercase tracking-wider block">
                      Periode Tagihan
                    </span>
                    <p className="font-bold text-lg text-[#1E1B18] mb-3">
                      {formatPeriod(invoice.dueDate)}
                    </p>

                    {/* Breakdown Rincian */}
                    <div className="space-y-1.5 text-xs bg-[#F8F6F1] p-3 rounded-xl border border-[#2C2825]/10 mb-4">
                      <div className="flex justify-between text-[#4A453F]">
                        <span>Sewa Kamar</span>
                        <span className="font-medium text-[#1E1B18]">
                          {formatRupiah(invoice.rentAmount)}
                        </span>
                      </div>
                      {invoice.utilityAmount > 0 && (
                        <div className="flex justify-between text-[#4A453F]">
                          <span>Utilitas & Listrik</span>
                          <span className="font-medium text-[#1E1B18]">
                            {formatRupiah(invoice.utilityAmount)}
                          </span>
                        </div>
                      )}
                      {invoice.otherAmount > 0 && (
                        <div className="flex justify-between text-[#4A453F]">
                          <span>Lainnya / Tambahan</span>
                          <span className="font-medium text-[#1E1B18]">
                            {formatRupiah(invoice.otherAmount)}
                          </span>
                        </div>
                      )}
                      {invoice.discountAmount > 0 && (
                        <div className="flex justify-between text-purple-700 font-medium">
                          <span>
                            Diskon ({invoice.discountReason || "Promo"})
                          </span>
                          <span>-{formatRupiah(invoice.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 mt-2 border-t border-[#2C2825]/10 text-rose-700 text-sm">
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(invoice.amount)}</span>
                      </div>
                    </div>

                    {/* Admin Discount Controls */}
                    {(invoice.status === "UNPAID" ||
                      invoice.status === "OVERDUE") && (
                      <div className="mb-4">
                        <AdminDiscountDialog
                          invoiceId={invoice.id}
                          currentDiscountAmount={invoice.discountAmount}
                          currentDiscountReason={invoice.discountReason}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#2C2825]/10">
                    <Button
                      onClick={() => handleMarkPaid(invoice.id)}
                      disabled={loadingInvoiceId !== null}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold gap-1.5 h-9 cursor-pointer"
                    >
                      {loadingInvoiceId === invoice.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      Tandai Lunas
                    </Button>

                    {invoice.status === "PENDING" && invoice.proofUrl ? (
                      <Dialog
                        open={previewImage === invoice.proofUrl}
                        onOpenChange={(open) => {
                          setPreviewImage(open ? invoice.proofUrl! : null);
                          if (!open) {
                            setShowRejectForm(false);
                            setRejectReason("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 border-[#2C2825]/20 text-[#1E1B18] hover:bg-[#FAF2EA] rounded-xl text-xs font-semibold gap-1.5 h-9 cursor-pointer"
                          >
                            <ImageIcon className="size-3.5 text-[#A45A3D]" />
                            <span>Lihat Bukti Bayar</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-[#2C2825]/15 bg-white p-0 overflow-hidden sm:max-w-md rounded-2xl">
                          <DialogHeader className="p-4 pb-3 bg-[#FAF2EA]/50 border-b border-[#2C2825]/10">
                            <DialogTitle className="text-[#1E1B18] text-base font-bold flex items-center gap-2">
                              <Receipt className="size-4 text-[#A45A3D]" />
                              <span>Verifikasi Bukti Pembayaran</span>
                            </DialogTitle>
                          </DialogHeader>

                          <div className="relative w-full aspect-[9/16] max-h-[60vh] bg-[#F8F6F1]">
                            <Image
                              src={invoice.proofUrl}
                              alt="Bukti Transfer"
                              fill
                              className="object-contain"
                            />
                          </div>

                          <div className="p-4 bg-[#FAF2EA]/30 border-t border-[#2C2825]/10">
                            {showRejectForm ? (
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Tuliskan alasan penolakan (misal: Gambar buram, Nominal kurang, Nama pengirim salah)..."
                                  value={rejectReason}
                                  onChange={(e) =>
                                    setRejectReason(e.target.value)
                                  }
                                  className="bg-white border-[#2C2825]/15 text-[#1E1B18] text-xs resize-none rounded-xl"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowRejectForm(false)}
                                    className="border-[#2C2825]/15 text-[#4A453F] rounded-xl text-xs"
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRejectPaid(invoice.id)}
                                    disabled={loadingInvoiceId !== null}
                                    className="bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs gap-1.5"
                                  >
                                    {loadingInvoiceId === invoice.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <CircleX className="size-3.5" />
                                    )}
                                    Kirim Penolakan
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowRejectForm(true)}
                                  className="border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs gap-1"
                                >
                                  <CircleX className="size-3.5" />
                                  Tolak
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewImage(null)}
                                    className="border-[#2C2825]/15 text-[#4A453F] rounded-xl text-xs"
                                  >
                                    Tutup
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkPaid(invoice.id)}
                                    disabled={loadingInvoiceId !== null}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs gap-1.5"
                                  >
                                    {loadingInvoiceId === invoice.id ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="size-3.5" />
                                    )}
                                    Konfirmasi Lunas
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Semua Tagihan Berjalan Lunas
              </p>
              <p className="text-xs text-emerald-800/80 mt-0.5">
                Tidak ada tunggakan sewa atau tagihan aktif yang tertunda untuk
                penghuni ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. RIWAYAT SEMUA TAGIHAN */}
      {/* ────────────────────────────────────────────────────────── */}
      <Card className="bg-white border-[#2C2825]/30 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="p-5 border-b border-[#2C2825]/10 bg-[#FAF2EA]/40">
          <CardTitle className="text-base font-bold text-[#1E1B18] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#FAF2EA] border border-[#A45A3D]/20 flex items-center justify-center text-[#A45A3D]">
                <Receipt className="size-4" />
              </div>
              <span>Riwayat Lengkap Tagihan</span>
            </div>
            <span className="text-xs text-[#7A7269] font-medium font-sans">
              Total {allInvoices.length} Catatan
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#FAF2EA]/50">
                  <TableRow className="border-[#2C2825]/30">
                    <TableHead className="text-xs font-bold text-[#4A453F] py-3.5 pl-6">
                      Periode
                    </TableHead>
                    <TableHead className="text-xs font-bold text-[#4A453F] py-3.5">
                      Rincian & Total
                    </TableHead>
                    <TableHead className="text-xs font-bold text-[#4A453F] py-3.5">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-bold text-[#4A453F] py-3.5 hidden sm:table-cell">
                      Tgl Bayar
                    </TableHead>
                    <TableHead className="text-xs font-bold text-[#4A453F] py-3.5 text-right pr-6">
                      Bukti Bayar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="border-[#2C2825]/5 hover:bg-[#FAF2EA]/30 transition-colors"
                    >
                      <TableCell className="font-semibold text-sm text-[#1E1B18] py-4 pl-6">
                        {formatPeriod(invoice.dueDate)}
                        <span className="block text-[11px] font-normal text-[#7A7269] mt-0.5">
                          Jatuh tempo: {formatDate(invoice.dueDate)}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#1E1B18]">
                            {formatRupiah(invoice.amount)}
                          </span>
                          <span className="text-[11px] text-[#7A7269] mt-0.5">
                            Sewa: {formatRupiah(invoice.rentAmount)}
                            {(invoice.utilityAmount > 0 ||
                              invoice.otherAmount > 0) && (
                              <>
                                {" "}
                                | Lain:{" "}
                                {formatRupiah(
                                  invoice.utilityAmount + invoice.otherAmount,
                                )}
                              </>
                            )}
                            {invoice.discountAmount > 0 && (
                              <span className="text-purple-700 font-medium">
                                {" "}
                                | Diskon -{formatRupiah(invoice.discountAmount)}
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            invoice.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : invoice.status === "PENDING"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {invoice.status === "PAID"
                            ? "Lunas"
                            : invoice.status === "PENDING"
                              ? "Menunggu Konfirmasi"
                              : "Belum Dibayar"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-[#4A453F] text-xs py-4 hidden sm:table-cell">
                        {invoice.paidAt ? (
                          <span className="font-medium text-[#1E1B18]">
                            {formatDate(invoice.paidAt)}
                          </span>
                        ) : (
                          <span className="text-[#7A7269]">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right py-4 pr-6">
                        {invoice.proofUrl ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs border-[#2C2825]/15 text-[#714A23] hover:bg-[#FAF2EA] gap-1 rounded-xl"
                              >
                                <Eye className="size-3.5" />
                                <span>Bukti</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-[#2C2825]/15 bg-white p-0 overflow-hidden sm:max-w-md rounded-2xl">
                              <DialogHeader className="p-4 pb-2 bg-[#FAF2EA]/50 border-b border-[#2C2825]/10">
                                <DialogTitle className="text-sm font-bold text-[#1E1B18]">
                                  Bukti Transfer —{" "}
                                  {formatPeriod(invoice.dueDate)}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="relative w-full aspect-[9/16] max-h-[70vh] bg-[#F8F6F1]">
                                <Image
                                  src={invoice.proofUrl}
                                  alt="Bukti Transfer"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-[#7A7269] text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 text-[#7A7269]">
              <Receipt className="size-10 mx-auto mb-2 opacity-30 text-[#7A7269]" />
              <p className="font-semibold text-sm text-[#4A453F]">
                Belum Ada Catatan Tagihan
              </p>
              <p className="text-xs text-[#7A7269] mt-0.5">
                Riwayat pembayaran akan muncul setelah tagihan dibuat atau
                digenerate otomatis.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
