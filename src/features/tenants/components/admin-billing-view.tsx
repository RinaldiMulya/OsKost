"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Receipt,
  CheckCircle2,
  CircleX,
  Clock,
  AlertTriangle,
  Search,
  Bell,
  Eye,
  Gift,
  Loader2,
  Tag,
  DollarSign,
  TrendingUp,
  FileWarning,
  RotateCcw,
} from "lucide-react";
import { AdminDiscountDialog } from "@/features/payment";
import {
  markInvoicePaidAction,
  rejectInvoicePaymentAction,
  sendBillingReminderAction,
} from "../actions";
import {
  approvePromoClaimAction,
  rejectPromoClaimAction,
  cancelPaymentAction,
} from "@/features/payment";

interface AdminBillingViewProps {
  data: {
    stats: {
      totalBilledThisMonth: number;
      totalPaidThisMonth: number;
      totalUnpaidAmount: number;
      pendingTransfersCount: number;
      pendingPromoClaimsCount: number;
    };
    invoices: any[];
    pendingPromoClaims: any[];
  };
}

export function AdminBillingView({ data }: AdminBillingViewProps) {
  const [activeTab, setActiveTab] = useState<"INVOICES" | "PROMOS">("INVOICES");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);
  const [loadingClaimId, setLoadingClaimId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const { stats, invoices, pendingPromoClaims } = data;

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

  // Filter invoices locally
  const filteredInvoices = invoices.filter((inv) => {
    const tenantName =
      inv.lease?.user?.tenantProfile?.fullName?.toLowerCase() || "";
    const roomNumber = inv.lease?.room?.number?.toLowerCase() || "";

    const matchesQuery =
      tenantName.includes(searchQuery.toLowerCase()) ||
      roomNumber.includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || inv.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  async function handleMarkPaid(invoiceId: string) {
    setLoadingInvoiceId(invoiceId);
    const result = await markInvoicePaidAction(invoiceId);
    setLoadingInvoiceId(null);
    if (result.success) {
      toast.success("Pembayaran berhasil ditandai lunas!");
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

  async function handleCancelPayment(invoiceId: string) {
    const confirmReset = window.confirm(
      "Apakah Anda yakin ingin membatalkan status PENDING tagihan ini dan mengembalikannya ke UNPAID?"
    );
    if (!confirmReset) return;

    setLoadingInvoiceId(invoiceId);
    const result = await cancelPaymentAction(invoiceId);
    setLoadingInvoiceId(null);

    if (result.success) {
      toast.success(result.message || "Status tagihan berhasil di-reset ke UNPAID.");
    } else {
      toast.error(result.error || "Gagal me-reset tagihan.");
    }
  }

  async function handleSendReminder(userId: string) {
    setSendingReminderId(userId);
    const result = await sendBillingReminderAction(userId);
    setSendingReminderId(null);
    if (result.success) {
      toast.success(
        `Reminder tagihan berhasil dikirim ke ${result.tenantName ?? "penghuni"}!`
      );
    } else {
      toast.error(result.error ?? "Gagal mengirim reminder tagihan.");
    }
  }

  async function handleApprovePromo(claimId: string) {
    setLoadingClaimId(claimId);
    const result = await approvePromoClaimAction(claimId);
    setLoadingClaimId(null);
    if (result.success) {
      toast.success(result.message || "Promo berhasil disetujui!");
    } else {
      toast.error(result.error || "Gagal menyetujui promo.");
    }
  }

  async function handleRejectPromo(claimId: string) {
    if (!rejectReason) {
      toast.error("Masukan alasan penolakan promo.");
      return;
    }
    setLoadingClaimId(claimId);
    const result = await rejectPromoClaimAction(claimId, rejectReason);
    setLoadingClaimId(null);
    if (result.success) {
      toast.success(result.message || "Pengajuan promo ditolak.");
      setShowRejectForm(false);
      setRejectReason("");
    } else {
      toast.error(result.error || "Gagal menolak promo.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Manajemen Tagihan & Keuangan
        </h1>
        <p className="text-sm text-zinc-400">
          Kelola tagihan sewa bulanan, verifikasi bukti transfer manual, dan
          konfirmasi klaim promo Google Review.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium">
                Total Tagihan Bulan Ini
              </p>
              <p className="text-xl font-bold text-white mt-1">
                {formatRupiah(stats.totalBilledThisMonth)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Sudah Lunas</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {formatRupiah(stats.totalPaidThisMonth)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Tunggakan Belum Lunas</p>
              <p className="text-xl font-bold text-amber-400 mt-1">
                {formatRupiah(stats.totalUnpaidAmount)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <FileWarning className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Verifikasi Masuk</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-white">
                  {stats.pendingTransfersCount} Transfer
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-lg font-bold text-amber-400">
                  {stats.pendingPromoClaimsCount} Promo
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Gift className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("INVOICES")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "INVOICES"
                  ? "bg-secondary text-white shadow-md shadow-secondary/20"
                  : "bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Daftar Semua Tagihan
            </button>

            <button
              onClick={() => setActiveTab("PROMOS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === "PROMOS"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-900/50 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Verifikasi Klaim Promo
              {stats.pendingPromoClaimsCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {stats.pendingPromoClaimsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: DAFTAR TAGIHAN */}
        {activeTab === "INVOICES" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Cari nama penghuni / nomor kamar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-white"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                {["ALL", "UNPAID", "PENDING", "PAID", "OVERDUE"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        statusFilter === status
                          ? "bg-zinc-100 text-zinc-900"
                          : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      {status === "ALL" && "Semua Status"}
                      {status === "UNPAID" && "Belum Bayar"}
                      {status === "PENDING" && "Menunggu Konfirmasi"}
                      {status === "PAID" && "Lunas"}
                      {status === "OVERDUE" && "Terlambat"}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Invoices Table */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-zinc-900">
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Penghuni & Kamar</TableHead>
                      <TableHead className="text-zinc-400">Periode</TableHead>
                      <TableHead className="text-zinc-400">Rincian Nominal</TableHead>
                      <TableHead className="text-zinc-400">Metode</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-right text-zinc-400">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((inv) => {
                        const tenantName =
                          inv.lease?.user?.tenantProfile?.fullName ||
                          "Penghuni Kost";
                        const roomNumber = inv.lease?.room?.number || "-";
                        const userId = inv.lease?.user?.id;

                        return (
                          <TableRow
                            key={inv.id}
                            className="border-zinc-800/50 hover:bg-zinc-800/30"
                          >
                            <TableCell>
                              <div>
                                <p className="font-semibold text-white text-sm">
                                  {tenantName}
                                </p>
                                <p className="text-xs text-zinc-400">
                                  Kamar {roomNumber}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-zinc-300">
                              {formatPeriod(inv.dueDate)}
                            </TableCell>

                            <TableCell>
                              <div className="space-y-0.5 text-xs">
                                <p className="font-bold text-emerald-400 text-sm">
                                  {formatRupiah(inv.amount)}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                  Sewa: {formatRupiah(inv.rentAmount)}
                                  {inv.tenantAdminFee > 0 &&
                                    ` + Admin: ${formatRupiah(inv.tenantAdminFee)}`}
                                  {inv.discountAmount > 0 && (
                                    <span className="text-purple-400 ml-1">
                                      (-{formatRupiah(inv.discountAmount)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-zinc-400">
                              {inv.provider === "MIDTRANS" ? (
                                <Badge
                                  variant="outline"
                                  className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px]"
                                >
                                  Midtrans
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-zinc-700 text-zinc-400 bg-zinc-800 text-[10px]"
                                >
                                  Manual / Onsite
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  inv.status === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : inv.status === "PENDING"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                {inv.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5 items-center">
                                {/* Tandai Lunas */}
                                {inv.status !== "PAID" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarkPaid(inv.id)}
                                    disabled={loadingInvoiceId === inv.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 gap-1"
                                  >
                                    {loadingInvoiceId === inv.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    Lunas
                                  </Button>
                                )}

                                {/* Reset Pending */}
                                {inv.status === "PENDING" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelPayment(inv.id)}
                                    disabled={loadingInvoiceId === inv.id}
                                    title="Reset Status ke UNPAID"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 px-2 gap-1"
                                  >
                                    {loadingInvoiceId === inv.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-3 w-3" />
                                    )}
                                    Batal Pending
                                  </Button>
                                )}

                                {/* Admin Discount Dialog */}
                                {(inv.status === "UNPAID" || inv.status === "OVERDUE") && (
                                  <AdminDiscountDialog
                                    invoiceId={inv.id}
                                    currentDiscountAmount={inv.discountAmount}
                                    currentDiscountReason={inv.discountReason}
                                  />
                                )}

                                {/* Lihat SS Transfer Manual */}
                                {inv.proofUrl && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs h-8 px-2"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-md">
                                      <DialogHeader className="p-4 pb-0 bg-zinc-900 border-b border-zinc-800">
                                        <DialogTitle className="text-zinc-100 flex items-center gap-2 text-sm">
                                          Bukti Transfer Manual
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="relative w-full aspect-[9/16] max-h-[70vh]">
                                        <Image
                                          src={inv.proofUrl}
                                          alt="Bukti Transfer"
                                          fill
                                          className="object-contain bg-black/50"
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}

                                {/* Kirim Reminder */}
                                {inv.status !== "PAID" && userId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendReminder(userId)}
                                    disabled={sendingReminderId === userId}
                                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs h-8 px-2"
                                  >
                                    {sendingReminderId === userId ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Bell className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-zinc-500"
                        >
                          Tidak ada data tagihan yang sesuai.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: VERIFIKASI PROMO */}
        {activeTab === "PROMOS" && (
          <div className="space-y-4">
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="border-b border-zinc-800/80">
                <CardTitle className="text-lg font-semibold text-zinc-200 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-amber-400" />
                  Pengajuan Klaim Promo Menunggu Verifikasi
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs">
                  Review bukti ulasan Google Maps Bintang 5 dari tenant sebelum
                  menyetujui pembebasan biaya admin.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {pendingPromoClaims.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingPromoClaims.map((claim) => {
                      const tenantName =
                        claim.user?.tenantProfile?.fullName || "Penghuni";
                      const roomNumber =
                        claim.invoice?.lease?.room?.number || "-";

                      return (
                        <div
                          key={claim.id}
                          className="bg-zinc-900/80 rounded-xl p-4 border border-amber-500/30 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-white text-sm">
                                {tenantName}
                              </p>
                              <p className="text-xs text-zinc-400">
                                Kamar {roomNumber} · Periode{" "}
                                {formatPeriod(claim.invoice?.dueDate)}
                              </p>
                            </div>
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                              {claim.discountCode}
                            </Badge>
                          </div>

                          {claim.googleName && (
                            <p className="text-xs text-zinc-300">
                              <span className="text-zinc-500">Nama Akun Google: </span>
                              <span className="font-semibold text-amber-400">
                                {claim.googleName}
                              </span>
                            </p>
                          )}

                          {/* Screenshot Preview */}
                          {claim.proofUrl && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 text-xs gap-2"
                                >
                                  <Eye className="h-3.5 w-3.5 text-amber-400" />
                                  Lihat Screenshot Ulasan Google Maps
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-md">
                                <DialogTitle className="sr-only">Screenshot Ulasan Google</DialogTitle>
                                <div className="relative w-full aspect-[9/16] max-h-[70vh]">
                                  <Image
                                    src={claim.proofUrl}
                                    alt="Screenshot Ulasan Google"
                                    fill
                                    className="object-contain bg-black/50"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-zinc-800">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = prompt("Alasan penolakan promo:");
                                if (reason) handleRejectPromo(claim.id);
                              }}
                              disabled={loadingClaimId === claim.id}
                              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1.5"
                            >
                              <CircleX className="h-3.5 w-3.5" />
                              Tolak
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleApprovePromo(claim.id)}
                              disabled={loadingClaimId === claim.id}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5"
                            >
                              {loadingClaimId === claim.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Setujui Promo
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-zinc-500 space-y-2">
                    <Gift className="h-10 w-10 mx-auto opacity-30 text-amber-400" />
                    <p className="text-xs">
                      Tidak ada pengajuan klaim promo yang membutuhkan verifikasi saat ini.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
