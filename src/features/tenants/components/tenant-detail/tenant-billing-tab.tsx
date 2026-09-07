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
import { rejectInvoicePaymentAction, sendBillingReminderAction } from "../../actions";

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
      toast.success("Pembayaran berhasil ditandai lunas!");
      setPreviewImage(null); // Tutup dialog jika terbuka
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
      setPreviewImage(null); // Tutup dialog jika terbuka
      setShowRejectForm(false);
      setRejectReason("");
    } else {
      toast.error(result.error ?? "Gagal menolak pembayaran.");
    }
  }

  async function handleSendReminder() {
    setIsSendingReminder(true);
    // Ambil userId dari tenant (user yang terhubung dengan lease)
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
      {/* TAGIHAN AKTIF CARD */}
      {hasUnpaid && (
        <Card className="border-red-500/30 bg-red-500/5 shadow-md shadow-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <FileWarning className="size-5" />
              Menunggu Pembayaran
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Tagihan bulan ini belum lunas atau menunggu konfirmasi Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {unpaidInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-zinc-900/80 rounded-xl p-5 border border-red-500/20 flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold tracking-wider uppercase rounded-bl-lg">
                    {invoice.status}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-zinc-400">Periode</p>
                    <p className="font-semibold text-lg text-white mb-4">
                      {formatPeriod(invoice.dueDate)}
                    </p>

                    {/* Breakdown */}
                    <div className="space-y-1.5 text-sm bg-black/20 p-3 rounded-lg mb-4">
                      <div className="flex justify-between text-zinc-400">
                        <span>Sewa Kamar</span>
                        <span className="text-zinc-200">
                          {formatRupiah(invoice.rentAmount)}
                        </span>
                      </div>
                      {invoice.utilityAmount > 0 && (
                        <div className="flex justify-between text-zinc-400">
                          <span>Utilitas (Listrik/Air)</span>
                          <span className="text-zinc-200">
                            {formatRupiah(invoice.utilityAmount)}
                          </span>
                        </div>
                      )}
                      {invoice.otherAmount > 0 && (
                        <div className="flex justify-between text-zinc-400">
                          <span>Lainnya</span>
                          <span className="text-zinc-200">
                            {formatRupiah(invoice.otherAmount)}
                          </span>
                        </div>
                      )}
                      {invoice.discountAmount > 0 && (
                        <div className="flex justify-between text-purple-400">
                          <span>Diskon ({invoice.discountReason || "Promo"})</span>
                          <span>-{formatRupiah(invoice.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-2 mt-2 border-t border-zinc-700/50 text-red-400">
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(invoice.amount)}</span>
                      </div>
                    </div>

                    {/* Admin Discount Controls */}
                    {(invoice.status === "UNPAID" || invoice.status === "OVERDUE") && (
                      <div className="mb-4">
                        <AdminDiscountDialog
                          invoiceId={invoice.id}
                          currentDiscountAmount={invoice.discountAmount}
                          currentDiscountReason={invoice.discountReason}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-4 border-t border-zinc-800">
                    <Button
                      onClick={() => handleMarkPaid(invoice.id)}
                      disabled={loadingInvoiceId !== null}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      {loadingInvoiceId === invoice.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
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
                            className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 gap-2"
                          >
                            <ImageIcon className="size-4" /> Lihat Bukti SS
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-md">
                          <DialogHeader className="p-4 pb-0 bg-zinc-900 border-b border-zinc-800">
                            <DialogTitle className="text-zinc-100 flex items-center gap-2">
                              <Receipt className="size-4" /> Bukti Pembayaran
                            </DialogTitle>
                          </DialogHeader>
                          <div className="relative w-full aspect-[9/16] max-h-[70vh]">
                            <Image
                              src={invoice.proofUrl}
                              alt="Bukti Transfer"
                              fill
                              className="object-contain bg-black/50"
                            />
                          </div>
                          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                            {showRejectForm ? (
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Alasan penolakan (misal: Gambar buram, Nominal tidak sesuai)"
                                  value={rejectReason}
                                  onChange={(e) =>
                                    setRejectReason(e.target.value)
                                  }
                                  className="bg-zinc-950 border-zinc-800 text-zinc-200 resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowRejectForm(false)}
                                    className="border-zinc-700 hover:bg-zinc-800 text-white"
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectPaid(invoice.id)}
                                    disabled={loadingInvoiceId !== null}
                                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                                  >
                                    {loadingInvoiceId === invoice.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <CircleX className="size-4" />
                                    )}
                                    Kirim Penolakan
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowRejectForm(true)}
                                  className="border-red-500/30 hover:bg-red-500 text-red-400 hover:text-red-100 gap-2"
                                >
                                  <CircleX className="size-4" />
                                  Tolak Pembayaran
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setPreviewImage(null)}
                                    className="border-zinc-700 hover:bg-zinc-800 text-white"
                                  >
                                    Tutup
                                  </Button>
                                  <Button
                                    onClick={() => handleMarkPaid(invoice.id)}
                                    disabled={loadingInvoiceId !== null}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                  >
                                    {loadingInvoiceId === invoice.id ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="size-4" />
                                    )}
                                    Konfirmasi Lunas
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button
                        onClick={handleSendReminder}
                        disabled={isSendingReminder}
                        variant="outline"
                        className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 gap-2"
                      >
                        {isSendingReminder ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Bell className="size-4" />
                        )}
                        {isSendingReminder ? "Mengirim..." : "Kirim Reminder"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RIWAYAT SEMUA TAGIHAN */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-800/80">
          <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
            <Receipt className="size-5 text-zinc-400" />
            Riwayat Semua Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 p-0 sm:p-6 sm:pt-4">
          {allInvoices.length > 0 ? (
            <div className="rounded-md border border-zinc-800/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-900 hover:bg-zinc-900">
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Periode</TableHead>
                    <TableHead className="text-zinc-400">
                      Rincian & Nominal
                    </TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400 hidden sm:table-cell">
                      Tgl Bayar
                    </TableHead>
                    <TableHead className="text-right text-zinc-400">
                      Bukti SS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <TableCell className="font-medium text-zinc-200">
                        {formatPeriod(invoice.dueDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-emerald-400">
                            {formatRupiah(invoice.amount)}
                          </span>
                          <span className="text-[11px] text-zinc-500">
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
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                                                    ${
                                                      invoice.status === "PAID"
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : invoice.status ===
                                                            "PENDING"
                                                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                          : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }
                                                `}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm hidden sm:table-cell">
                        {formatDate(invoice.paidAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.proofUrl ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              >
                                <Eye className="size-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-md">
                              <DialogTitle className="sr-only">Bukti Transfer</DialogTitle>
                              <div className="relative w-full aspect-[9/16] max-h-[70vh]">
                                <Image
                                  src={invoice.proofUrl}
                                  alt="Bukti Transfer"
                                  fill
                                  className="object-contain bg-black/50"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-zinc-600 text-sm">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <Receipt className="size-12 mx-auto mb-3 opacity-20" />
              <p>Belum ada tagihan.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
